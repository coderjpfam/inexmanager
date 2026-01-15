/**
 * Logger Utility
 * Provides environment-aware logging for production and development
 */

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

/**
 * Log error messages (always logged, even in production)
 * Use for critical errors that need to be tracked
 */
export const logError = (message: string, error?: unknown): void => {
  if (error) {
    console.error(`[ERROR] ${message}`, error);
  } else {
    console.error(`[ERROR] ${message}`);
  }
};

/**
 * Log warning messages (only in development)
 * Use for non-critical warnings
 */
export const logWarning = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, ...args);
  }
};

/**
 * Log info messages (only in development)
 * Use for debugging information
 */
export const logInfo = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...args);
  }
};

/**
 * Log debug messages (only in development)
 * Use for detailed debugging
 */
export const logDebug = (message: string, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};
