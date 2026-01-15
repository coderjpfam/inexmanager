/**
 * API Client with Automatic Token Refresh
 * Handles token injection, 401 errors, and automatic token refresh
 */

import { store } from '@/store';
import { refreshToken, logout } from '@/store/authSlice';
import type { RootState, AppDispatch } from '@/store';
import { shouldRefreshToken, isTokenExpired } from '@/utils/token';
import { categorizeError, isRetryableError, ErrorType, type CategorizedError } from '@/utils/errors';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean; // Skip token injection for auth endpoints
  skipRefresh?: boolean; // Skip automatic refresh for refresh token endpoint
  retries?: number; // Number of retry attempts for retryable errors (default: 3)
  retryDelay?: number; // Delay between retries in milliseconds (default: 1000)
  timeout?: number; // Request timeout in milliseconds (default: 30000)
}

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Get current access token from Redux store
 */
const getAccessToken = (): string | null => {
  const state = store.getState() as RootState;
  return state.auth.token;
};

/**
 * Get current refresh token from Redux store
 */
const getRefreshToken = (): string | null => {
  const state = store.getState() as RootState;
  return state.auth.refreshToken;
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  const dispatch = store.dispatch as AppDispatch;
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    isRefreshing = false;
    refreshPromise = null;
    // No refresh token, logout user
    dispatch(logout());
    return null;
  }

  // Check if refresh token is expired
  if (isTokenExpired(currentRefreshToken)) {
    isRefreshing = false;
    refreshPromise = null;
    // Refresh token is expired, logout user
    console.warn('Refresh token expired, logging out user');
    dispatch(logout());
    return null;
  }

  refreshPromise = (async () => {
    try {
      const result = await dispatch(refreshToken({ refreshToken: currentRefreshToken }));
      
      if (refreshToken.fulfilled.match(result)) {
        // Token refreshed successfully, return new token
        return result.payload.token;
      } else {
        // Refresh failed, logout user
        console.warn('Token refresh failed, logging out user');
        dispatch(logout());
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      dispatch(logout());
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create a timeout promise
 */
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
  });
};

/**
 * Make API request with automatic token injection and refresh
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    skipAuth = false,
    skipRefresh = false,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;
  
  let lastError: CategorizedError | null = null;
  let attempt = 0;
  
  // Retry loop
  while (attempt <= retries) {
    try {
      const result = await makeRequest<T>(endpoint, {
        skipAuth,
        skipRefresh,
        ...fetchOptions,
      }, timeout);
      
      return result;
    } catch (error: any) {
      // Categorize the error
      const categorized = categorizeError(error, error.statusCode);
      lastError = categorized;
      
      // Check if error is retryable and we have retries left
      if (isRetryableError(categorized) && attempt < retries) {
        attempt++;
        
        // Calculate exponential backoff delay
        const delay = retryDelay * Math.pow(2, attempt - 1);
        
        // Wait before retrying
        await sleep(delay);
        
        // Continue to next retry attempt
        continue;
      }
      
      // Not retryable or out of retries
      return {
        success: false,
        message: categorized.message,
        error: categorized.type,
      };
    }
  }
  
  // If we get here, all retries failed
  return {
    success: false,
    message: lastError?.message || 'Request failed after multiple attempts',
    error: lastError?.type || ErrorType.UNKNOWN,
  };
};

/**
 * Make a single API request (internal function)
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestOptions & { timeout?: number },
  timeout: number
): Promise<ApiResponse<T>> => {
  const { skipAuth = false, skipRefresh = false, timeout: requestTimeout = timeout, ...fetchOptions } = options;

  // Get access token
  let accessToken = skipAuth ? null : getAccessToken();

  // Proactive token refresh: Check if token should be refreshed before making request
  if (accessToken && !skipAuth && !skipRefresh) {
    if (shouldRefreshToken(accessToken)) {
      // Token is about to expire, refresh it proactively
      const newToken = await refreshAccessToken();
      if (newToken) {
        accessToken = newToken;
      } else {
        // Refresh failed, token might be expired
        if (isTokenExpired(accessToken)) {
          return {
            success: false,
            message: 'Session expired. Please sign in again.',
            error: 'Token expired and refresh failed',
          };
        }
      }
    } else if (isTokenExpired(accessToken)) {
      // Token is already expired, try to refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        accessToken = newToken;
      } else {
        return {
          success: false,
          message: 'Session expired. Please sign in again.',
          error: 'Token expired and refresh failed',
        };
      }
    }
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add Authorization header if token exists
  if (accessToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    // Create timeout promise
    const timeoutPromise = createTimeout(requestTimeout);
    
    // Make the request with timeout
    const fetchPromise = fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // Parse response
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, throw error for retry logic
      const error: any = new Error('Invalid response from server');
      error.statusCode = response.status;
      throw error;
    }

    // Handle 401 Unauthorized - token expired
    if (response.status === 401 && !skipAuth && !skipRefresh) {
      // Try to refresh token
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry the original request with new token (not through retry loop)
        return apiRequest<T>(endpoint, {
          ...options,
          skipAuth: false,
          skipRefresh: true, // Prevent infinite loop
        });
      } else {
        // Refresh failed, throw error
        const error: any = new Error('Session expired. Please sign in again.');
        error.statusCode = 401;
        throw error;
      }
    }

    // Handle other HTTP errors - throw for retry logic
    if (!response.ok && response.status !== 401) {
      const error: any = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      error.statusCode = response.status;
      error.responseData = data;
      throw error;
    }

    // Return successful response
    return data;
  } catch (error: any) {
    // Re-throw error for retry logic to handle
    throw error;
  }
};
