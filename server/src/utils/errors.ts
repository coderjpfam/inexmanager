/**
 * Error Handling Utilities
 * Centralized error handling with proper error classes and sanitization
 */

/**
 * Custom Application Error Class
 * Used for operational errors (expected errors that we handle)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly isTrusted: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.isTrusted = true; // Operational errors are trusted

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, public readonly errors?: Array<{ field?: string; message: string }>) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 * Used for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 * Used for authorization failures
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 * Used when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 * Used when there's a conflict (e.g., duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * Centralized Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */
import { Request, Response, NextFunction } from 'express';
import { logError } from './logger';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      requestId: req.requestId,
      ...(err instanceof ValidationError && err.errors && { errors: err.errors }),
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid input data',
      requestId: req.requestId,
    });
    return;
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      requestId: req.requestId,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      requestId: req.requestId,
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
      requestId: req.requestId,
    });
    return;
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError' && 'errors' in err) {
    const mongooseError = err as { errors: Record<string, { path: string; message: string }> };
    const errors = Object.values(mongooseError.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      requestId: req.requestId,
    });
    return;
  }

  // Log unexpected errors for debugging
  logError('Unexpected error', err, {
    requestId: req.requestId,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Send generic error message in production, detailed in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: isDevelopment 
      ? err.message || 'Internal server error'
      : 'Internal server error',
    requestId: req.requestId,
    ...(isDevelopment && { 
      stack: err.stack,
      name: err.name,
    }),
  });
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
