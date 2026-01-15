/**
 * Error Utilities
 * Categorizes and handles different types of errors
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface CategorizedError {
  type: ErrorType;
  message: string;
  originalError?: Error | unknown;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: Error | unknown): boolean => {
  if (!error) return false;
  
  // Type guard to safely access error properties
  const hasErrorProperties = (err: unknown): err is { message?: string; name?: string } => {
    return typeof err === 'object' && err !== null;
  };
  
  if (!hasErrorProperties(error)) return false;
  
  // Check for common network error patterns
  const errorMessage = (error.message?.toLowerCase() || '');
  const errorName = (error.name?.toLowerCase() || '');
  
  // Check for offline status (web only)
  const isOffline = typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine;
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('network request failed') ||
    errorName === 'networkerror' ||
    errorName === 'typeerror' ||
    isOffline
  );
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: Error | unknown): boolean => {
  if (!error) return false;
  
  // Type guard to safely access error properties
  const hasErrorProperties = (err: unknown): err is { message?: string } => {
    return typeof err === 'object' && err !== null;
  };
  
  if (!hasErrorProperties(error)) return false;
  
  const errorMessage = (error.message?.toLowerCase() || '');
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('aborted')
  );
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: CategorizedError): boolean => {
  if (!error.retryable) return false;
  
  // Network errors are retryable
  if (error.type === ErrorType.NETWORK) return true;
  
  // Timeout errors are retryable
  if (error.type === ErrorType.TIMEOUT) return true;
  
  // Server errors (5xx) are retryable
  if (error.type === ErrorType.SERVER) return true;
  
  // Rate limiting (429) is retryable
  if (error.statusCode === 429) return true;
  
  return false;
};

/**
 * Categorize error based on type and status code
 */
export const categorizeError = (error: Error | unknown, statusCode?: number): CategorizedError => {
  // Type guard to check if error has message property
  const hasMessage = (err: unknown): err is { message?: string; name?: string } => {
    return typeof err === 'object' && err !== null;
  };
  
  const errorObj = hasMessage(error) ? error : { message: String(error), name: undefined };
  // Network errors
  if (isNetworkError(error)) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your internet connection.',
      originalError: error,
      retryable: true,
    };
  }
  
  // Timeout errors
  if (isTimeoutError(error)) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
      retryable: true,
    };
  }
  
  // Extract message from error object
  const errorMessage = errorObj.message || 'An error occurred';
  
  // HTTP status code based errors
  if (statusCode) {
    // Authentication errors (401, 403)
    if (statusCode === 401 || statusCode === 403) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication failed. Please sign in again.',
        originalError: error,
        retryable: false,
        statusCode,
      };
    }
    
    // Validation errors (400, 422)
    if (statusCode === 400 || statusCode === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: errorMessage || 'Invalid request. Please check your input.',
        originalError: error,
        retryable: false,
        statusCode,
      };
    }
    
    // Server errors (5xx)
    if (statusCode >= 500 && statusCode < 600) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error. Please try again later.',
        originalError: error,
        retryable: true,
        statusCode,
      };
    }
    
    // Rate limiting (429)
    if (statusCode === 429) {
      return {
        type: ErrorType.SERVER,
        message: 'Too many requests. Please try again later.',
        originalError: error,
        retryable: true,
        statusCode,
      };
    }
    
    // Client errors (4xx)
    if (statusCode >= 400 && statusCode < 500) {
      return {
        type: ErrorType.CLIENT,
        message: errorMessage || 'Request error. Please check your input.',
        originalError: error,
        retryable: false,
        statusCode,
      };
    }
  }
  
  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage || 'An unexpected error occurred.',
    originalError: error,
    retryable: false,
    statusCode,
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: CategorizedError, fallback?: string): string => {
  // Use custom message if provided
  if (fallback) return fallback;
  
  // Return categorized message
  return error.message;
};
