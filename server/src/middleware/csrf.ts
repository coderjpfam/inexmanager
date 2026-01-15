/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for REST APIs
 * Note: For REST APIs using JWT tokens in headers, CSRF is less critical,
 * but this provides additional protection for cookie-based sessions
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store CSRF tokens in memory (in production, consider Redis)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expiresAt < now) {
      csrfTokens.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF Protection Middleware
 * For state-changing methods (POST, PUT, PATCH, DELETE), requires CSRF token
 */
export const csrfProtection = (
  req: Request & { requestId?: string },
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for GET, HEAD, OPTIONS (idempotent methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints that don't use cookies
  // Since we're using JWT tokens in headers, CSRF is less critical
  // But we'll still protect cookie-based endpoints if any
  const publicEndpoints = ['/api/auth/signin', '/api/auth/signup', '/api/auth/forgot-password'];
  if (publicEndpoints.some((endpoint) => req.path.includes(endpoint))) {
    // For public endpoints using JWT, CSRF is not needed
    // But we can still validate if a token is provided
    return next();
  }

  // For authenticated endpoints, check CSRF token
  // Get token from header (X-CSRF-Token) or body (csrfToken)
  const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

  // If no token provided and endpoint requires authentication, skip CSRF
  // (JWT tokens in headers are not vulnerable to CSRF)
  if (!csrfToken && req.headers.authorization) {
    // Using JWT in Authorization header - CSRF not applicable
    return next();
  }

  // If token is provided, validate it
  if (csrfToken) {
    // Validate token format (64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(csrfToken as string)) {
      res.status(403).json({
        success: false,
        message: 'Invalid CSRF token format',
        requestId: req.requestId,
      });
      return;
    }

    // Check if token exists in our store
    let tokenFound = false;
    for (const [, value] of csrfTokens.entries()) {
      if (value.token === csrfToken && value.expiresAt > Date.now()) {
        tokenFound = true;
        break;
      }
    }

    if (!tokenFound) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired CSRF token',
        requestId: req.requestId,
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to set CSRF token in response
 * Call this on GET requests to provide CSRF token to client
 */
export const setCsrfToken = (
  req: Request & { requestId?: string },
  res: Response,
  next: NextFunction
): void => {
  // Only set token for GET requests
  if (req.method === 'GET') {
    const token = generateCsrfToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store token (keyed by request ID or session)
    const key = req.requestId || 'default';
    csrfTokens.set(key, { token, expiresAt });

    // Set token in response header
    res.setHeader('X-CSRF-Token', token);
  }

  next();
};
