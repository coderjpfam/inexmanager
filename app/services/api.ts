/**
 * API Service
 * Base configuration and helper functions for API calls
 * Uses api-client for automatic token refresh
 */

import { apiRequest, ApiResponse } from './api-client';

// Re-export ApiResponse for backward compatibility
export type { ApiResponse };

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage?: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePath: string;
  currency: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Legacy apiRequest - now uses api-client
 * Kept for backward compatibility
 * @deprecated Use apiRequest from api-client directly
 */

/**
 * Auth API endpoints
 */
export const authApi = {
  signup: async (payload: SignupPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for signup
    });
  },

  signin: async (payload: SigninPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for signin
    });
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload
  ): Promise<ApiResponse> => {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for forgot password
    });
  },

  resetPassword: async (
    payload: ResetPasswordPayload
  ): Promise<ApiResponse> => {
    return apiRequest(`/api/auth/reset-password?token=${payload.token}`, {
      method: 'POST',
      body: JSON.stringify({
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      }),
      skipAuth: true, // Skip token for reset password (uses token in query)
    });
  },

  verifyAccount: async (token: string): Promise<ApiResponse> => {
    return apiRequest(`/api/auth/verify-account?token=${token}`, {
      method: 'GET',
      skipAuth: true, // Skip token for verify account (uses token in query)
    });
  },

  verifyToken: async (token: string): Promise<ApiResponse<{ user: { userId: string; email: string } }>> => {
    // For verifyToken, we pass the token explicitly (used during app load)
    return apiRequest('/api/auth/verify-token', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      skipAuth: true, // Skip automatic token injection, using explicit token
    });
  },

  refreshToken: async (
    payload: RefreshTokenPayload
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    return apiRequest('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true, // Skip token for refresh token endpoint
      skipRefresh: true, // Prevent refresh loop
    });
  },
};
