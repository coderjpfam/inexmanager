/**
 * Rate Limiting Configuration
 * Centralized configuration for all API endpoint rate limits
 */

export interface ThrottleConfig {
  limit: number;
  ttl: number;
}

export const throttleConfig = {
  // Authentication endpoints
  signup: { limit: 5, ttl: 60000 } as ThrottleConfig, // 5 requests per minute
  signin: { limit: 10, ttl: 60000 } as ThrottleConfig, // 10 requests per minute
  forgotPassword: { limit: 3, ttl: 300000 } as ThrottleConfig, // 3 requests per 5 minutes
  resetPassword: { limit: 5, ttl: 60000 } as ThrottleConfig, // 5 requests per minute
  verifyAccount: { limit: 10, ttl: 60000 } as ThrottleConfig, // 10 requests per minute
  refreshToken: { limit: 20, ttl: 60000 } as ThrottleConfig, // 20 requests per minute
  verifyToken: { limit: 100, ttl: 60000 } as ThrottleConfig, // 100 requests per minute (protected endpoint)
} as const;
