/**
 * Request ID Middleware
 * Generates a unique request ID for each request and attaches it to the request object
 * This enables request tracing across the entire system
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to generate and attach request ID to each request
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique request ID
  const requestId = uuidv4();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Add to response headers for client-side tracing
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
