/**
 * Request Deduplication Middleware
 * Prevents duplicate requests within a time window
 * Useful for preventing double-clicks and race conditions
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface DeduplicationCache {
  [key: string]: number; // timestamp when request was made
}

// In-memory cache for request deduplication
// In production, consider using Redis for distributed systems
const requestCache: DeduplicationCache = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  Object.keys(requestCache).forEach((key) => {
    if (now - requestCache[key] > windowMs) {
      delete requestCache[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Generate a unique key for a request
 * Based on method, path, user ID (if authenticated), and request body hash
 */
const generateRequestKey = (req: Request & { requestId?: string; user?: { userId: string } }): string => {
  const method = req.method;
  const path = req.path;
  const userId = req.user?.userId || 'anonymous';
  
  // Create hash of request body for POST/PUT/PATCH requests
  let bodyHash = '';
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    // Exclude certain fields that should be unique (like timestamps, tokens)
    const bodyCopy = { ...req.body };
    delete bodyCopy.token; // Token is unique per request
    delete bodyCopy.refreshToken; // Refresh token is unique
    bodyHash = crypto
      .createHash('md5')
      .update(JSON.stringify(bodyCopy))
      .digest('hex')
      .substring(0, 8);
  }
  
  return `${method}:${path}:${userId}:${bodyHash}`;
};

/**
 * Request deduplication middleware
 * Prevents duplicate requests within a time window (default: 2 seconds)
 */
export const requestDeduplication = (
  windowMs: number = 2000 // Default: 2 seconds
) => {
  return (req: Request & { requestId?: string; user?: { userId: string } }, res: Response, next: NextFunction): void => {
    // Only apply to state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Skip for certain endpoints that should allow duplicates
    const skipPaths = ['/api/auth/refresh-token', '/api/auth/verify-token'];
    if (skipPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    const requestKey = generateRequestKey(req);
    const now = Date.now();
    const lastRequestTime = requestCache[requestKey];

    // Check if this is a duplicate request within the time window
    if (lastRequestTime && now - lastRequestTime < windowMs) {
      res.status(429).json({
        success: false,
        message: 'Duplicate request detected. Please wait a moment before trying again.',
        requestId: req.requestId,
      });
      return;
    }

    // Store this request timestamp
    requestCache[requestKey] = now;

    next();
  };
};
