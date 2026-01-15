/**
 * API Service
 * Base configuration and helper functions for API calls
 * Uses api-client for automatic token refresh
 */

import { apiRequest, ApiResponse } from './api-client';

// Re-export ApiResponse for backward compatibility
export type { ApiResponse };

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage?: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePath: string;
  currency: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Legacy apiRequest - now uses api-client
 * Kept for backward compatibility
 * @deprecated Use apiRequest from api-client directly
 */

/**
 * API Base URL - Version 1
 */
const API_BASE = '/api/v1';

/**
 * Auth API endpoints (Version 1)
 */
export const authApi = {
  signup: async (payload: SignupPayload, signal?: AbortSignal): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(`${API_BASE}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for signup
      signal, // Support request cancellation
    });
  },

  signin: async (payload: SigninPayload, signal?: AbortSignal): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>(`${API_BASE}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for signin
      signal, // Support request cancellation
    });
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
    signal?: AbortSignal
  ): Promise<ApiResponse> => {
    return apiRequest(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for forgot password
      signal, // Support request cancellation
    });
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
    signal?: AbortSignal
  ): Promise<ApiResponse> => {
    return apiRequest(`${API_BASE}/auth/reset-password?token=${payload.token}`, {
      method: 'POST',
      body: JSON.stringify({
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      }),
      skipAuth: true, // Skip token for reset password (uses token in query)
      signal, // Support request cancellation
    });
  },

  verifyAccount: async (token: string, signal?: AbortSignal): Promise<ApiResponse> => {
    return apiRequest(`${API_BASE}/auth/verify-account?token=${token}`, {
      method: 'GET',
      skipAuth: true, // Skip token for verify account (uses token in query)
      signal, // Support request cancellation
    });
  },

  verifyToken: async (token: string, signal?: AbortSignal): Promise<ApiResponse<{ user: { userId: string; email: string } }>> => {
    // For verifyToken, we pass the token explicitly (used during app load)
    return apiRequest(`${API_BASE}/auth/verify-token`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      skipAuth: true, // Skip automatic token injection, using explicit token
      signal, // Support request cancellation
    });
  },

  refreshToken: async (
    payload: RefreshTokenPayload,
    signal?: AbortSignal
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    return apiRequest(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for refresh token endpoint
      skipRefresh: true, // Prevent refresh loop
      signal, // Support request cancellation
    });
  },
};
