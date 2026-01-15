/**
 * Token Utility
 * Handles JWT token decoding, expiration checking, and proactive refresh
 */

export interface DecodedToken {
  userId?: string;
  email?: string;
  exp?: number; // Expiration timestamp (Unix time in seconds)
  iat?: number; // Issued at timestamp
  [key: string]: string | number | boolean | undefined; // Other token claims
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This does NOT verify the token signature, only decodes it
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed (base64url decoding)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    // Decode base64
    const decoded = atob(padded);
    
    // Parse JSON
    return JSON.parse(decoded) as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before expiration (default: 60)
 * @returns true if token is expired or will expire within buffer time
 */
export const isTokenExpired = (token: string | null, bufferSeconds: number = 60): boolean => {
  if (!token) {
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    // If we can't decode or no expiration, consider it expired for safety
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;

  // Token is expired if current time + buffer >= expiration time
  return currentTime + bufferTime >= expirationTime;
};

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export const getTokenExpiration = (token: string | null): number | null => {
  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
};

/**
 * Get time until token expires
 * @param token - JWT token string
 * @returns Time in milliseconds until expiration, or null if invalid/expired
 */
export const getTimeUntilExpiration = (token: string | null): number | null => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return null;
  }

  const timeUntilExpiration = expiration - Date.now();
  return timeUntilExpiration > 0 ? timeUntilExpiration : null;
};

/**
 * Check if token should be refreshed (proactive refresh)
 * @param token - JWT token string
 * @param refreshThresholdSeconds - Refresh if expires within this time (default: 300 = 5 minutes)
 * @returns true if token should be refreshed
 */
export const shouldRefreshToken = (
  token: string | null,
  refreshThresholdSeconds: number = 300
): boolean => {
  if (!token) {
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Can't decode, should refresh
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const refreshThreshold = refreshThresholdSeconds * 1000;

  // Should refresh if expiration is within threshold
  return expirationTime - currentTime <= refreshThreshold;
};
