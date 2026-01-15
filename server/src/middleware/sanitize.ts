/**
 * Input Sanitization Middleware
 * Sanitizes user inputs to prevent XSS attacks
 */

import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * XSS Sanitization Options
 */
const xssOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true, // Strip tags not in whitelist
  stripIgnoreTagBody: ['script'], // Strip script tags and their content
  allowList: {
    // Allow specific safe attributes if needed
  },
  onTagAttr: (tag: string, name: string, value: string) => {
    // Remove dangerous attributes
    if (name.startsWith('on') || name === 'javascript' || name === 'vbscript') {
      return '';
    }
    return undefined;
  },
};

/**
 * Sanitize a string value
 */
const sanitizeString = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value, xssOptions);
  }
  return value;
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Input Sanitization Middleware
 * Sanitizes request body, query, and params to prevent XSS
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body) as typeof req.body;
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as typeof req.query;
  }

  // Sanitize route parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }

  next();
};
