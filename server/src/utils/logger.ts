/**
 * Logger Utility
 * Provides environment-aware logging for production and development
 * Includes request ID support for tracing
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Format log message with context
 */
const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context
    ? ` ${JSON.stringify(context)}`
    : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

/**
 * Log error messages (always logged, even in production)
 * Use for critical errors that need to be tracked
 */
export const logError = (message: string, error?: unknown, context?: LogContext): void => {
  const formattedMessage = formatMessage('error', message, context);
  if (error) {
    console.error(formattedMessage, error);
  } else {
    console.error(formattedMessage);
  }
};

/**
 * Log warning messages (logged in production, detailed in development)
 * Use for non-critical warnings
 */
export const logWarning = (message: string, context?: LogContext, ...args: unknown[]): void => {
  const formattedMessage = formatMessage('warn', message, context);
  if (isDevelopment && args.length > 0) {
    console.warn(formattedMessage, ...args);
  } else {
    console.warn(formattedMessage);
  }
};

/**
 * Log info messages (only in development, or with context in production)
 * Use for debugging information
 */
export const logInfo = (message: string, context?: LogContext, ...args: unknown[]): void => {
  const formattedMessage = formatMessage('info', message, context);
  if (isDevelopment) {
    if (args.length > 0) {
      console.log(formattedMessage, ...args);
    } else {
      console.log(formattedMessage);
    }
  } else if (context?.requestId) {
    // In production, only log info with request ID for tracing
    console.log(formattedMessage);
  }
};

/**
 * Log debug messages (only in development)
 * Use for detailed debugging
 */
export const logDebug = (message: string, context?: LogContext, ...args: unknown[]): void => {
  if (isDevelopment) {
    const formattedMessage = formatMessage('debug', message, context);
    if (args.length > 0) {
      console.log(formattedMessage, ...args);
    } else {
      console.log(formattedMessage);
    }
  }
};
