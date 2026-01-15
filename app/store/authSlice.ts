import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, SignupPayload, SigninPayload, ForgotPasswordPayload, ResetPasswordPayload, RefreshTokenPayload, User, AuthResponse } from '../services/api';
import { storage } from '../utils/storage';

// Extended payload types that include optional signal for request cancellation
type SignupPayloadWithSignal = SignupPayload & { signal?: AbortSignal };
type SigninPayloadWithSignal = SigninPayload & { signal?: AbortSignal };

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Signup states
  signupLoading: boolean;
  signupError: string | null;

  // Signin states
  signinLoading: boolean;
  signinError: string | null;

  // Forgot password states
  forgotPasswordLoading: boolean;
  forgotPasswordError: string | null;

  // Reset password states
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;

  // Verify account states
  verifyAccountLoading: boolean;
  verifyAccountError: string | null;

  // Verify token states
  verifyTokenLoading: boolean;
  verifyTokenError: string | null;

  // Refresh token states
  refreshTokenLoading: boolean;
  refreshTokenError: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  signupLoading: false,
  signupError: null,

  signinLoading: false,
  signinError: null,

  forgotPasswordLoading: false,
  forgotPasswordError: null,

  resetPasswordLoading: false,
  resetPasswordError: null,

  verifyAccountLoading: false,
  verifyAccountError: null,

  verifyTokenLoading: false,
  verifyTokenError: null,

  refreshTokenLoading: false,
  refreshTokenError: null,
};

// Async thunks for each API
export const signup = createAsyncThunk(
  'auth/signup',
  async (payload: SignupPayloadWithSignal, { rejectWithValue, signal }) => {
    try {
      // Use provided signal or thunk's signal
      const abortSignal = payload.signal || signal;
      const { signal: _, ...actualPayload } = payload;
      const response = await authApi.signup(actualPayload, abortSignal);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Signup failed');
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError' || error.message === 'Request aborted') {
        return rejectWithValue('Request cancelled');
      }
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const signin = createAsyncThunk(
  'auth/signin',
  async (payload: SigninPayloadWithSignal, { rejectWithValue, signal }) => {
    try {
      // Use provided signal or thunk's signal
      const abortSignal = payload.signal || signal;
      const { signal: _, ...actualPayload } = payload;
      const response = await authApi.signin(actualPayload, abortSignal);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Signin failed');
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError' || error.message === 'Request aborted') {
        return rejectWithValue('Request cancelled');
      }
      return rejectWithValue(error.message || 'Signin failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(payload);
      if (response.success) {
        return response.message;
      }
      return rejectWithValue(response.message || 'Failed to send reset link');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send reset link');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(payload);
      if (response.success) {
        return response.message;
      }
      return rejectWithValue(response.message || 'Password reset failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const verifyAccount = createAsyncThunk(
  'auth/verifyAccount',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyAccount(token);
      if (response.success) {
        return response.message;
      }
      return rejectWithValue(response.message || 'Account verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Account verification failed');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyToken(token);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Token verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (payload: RefreshTokenPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken(payload);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Token refresh failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      // Clear all errors
      state.signupError = null;
      state.signinError = null;
      state.forgotPasswordError = null;
      state.resetPasswordError = null;
      state.verifyAccountError = null;
      state.verifyTokenError = null;
      state.refreshTokenError = null;
      // Clear storage
      storage.clearAll();
    },
    loadCredentials: (state, action: PayloadAction<{ user: User | null; token: string | null; refreshToken: string | null }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = !!action.payload.token;
    },
    clearSignupError: (state) => {
      state.signupError = null;
    },
    clearSigninError: (state) => {
      state.signinError = null;
    },
    clearForgotPasswordError: (state) => {
      state.forgotPasswordError = null;
    },
    clearResetPasswordError: (state) => {
      state.resetPasswordError = null;
    },
    clearVerifyAccountError: (state) => {
      state.verifyAccountError = null;
    },
    clearVerifyTokenError: (state) => {
      state.verifyTokenError = null;
    },
    clearRefreshTokenError: (state) => {
      state.refreshTokenError = null;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      // Persist to storage
      storage.saveToken(action.payload.token);
      storage.saveRefreshToken(action.payload.refreshToken);
      storage.saveUser(action.payload.user);
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.signupLoading = true;
        state.signupError = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.signupLoading = false;
        // Don't authenticate user after signup - require email verification first
        // Store user data but don't set isAuthenticated
        // Don't store tokens - user needs to verify email first
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.signupError = null;
        // Don't persist tokens - user must verify email before authentication
      })
      .addCase(signup.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupError = action.payload as string;
      });

    // Signin
    builder
      .addCase(signin.pending, (state) => {
        state.signinLoading = true;
        state.signinError = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.signinLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.signinError = null;
        // Persist to storage
        storage.saveToken(action.payload.token);
        storage.saveRefreshToken(action.payload.refreshToken);
        storage.saveUser(action.payload.user);
      })
      .addCase(signin.rejected, (state, action) => {
        state.signinLoading = false;
        state.signinError = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload as string;
      });

    // Verify Account
    builder
      .addCase(verifyAccount.pending, (state) => {
        state.verifyAccountLoading = true;
        state.verifyAccountError = null;
      })
      .addCase(verifyAccount.fulfilled, (state) => {
        state.verifyAccountLoading = false;
        state.verifyAccountError = null;
        // Update user verification status if user is logged in
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.verifyAccountLoading = false;
        state.verifyAccountError = action.payload as string;
      });

    // Verify Token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.verifyTokenLoading = true;
        state.verifyTokenError = null;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.verifyTokenLoading = false;
        state.verifyTokenError = null;
        // Token is valid, ensure user is authenticated
        if (state.token) {
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.verifyTokenLoading = false;
        state.verifyTokenError = action.payload as string;
        // Token is invalid, clear auth state
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        // Clear storage
        storage.clearAll();
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.refreshTokenLoading = true;
        state.refreshTokenError = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.refreshTokenLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.refreshTokenError = null;
        // Persist to storage
        storage.saveToken(action.payload.token);
        storage.saveRefreshToken(action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.refreshTokenLoading = false;
        state.refreshTokenError = action.payload as string;
      });
  },
});

export const {
  logout,
  clearSignupError,
  clearSigninError,
  clearForgotPasswordError,
  clearResetPasswordError,
  clearVerifyAccountError,
  clearVerifyTokenError,
  clearRefreshTokenError,
  setCredentials,
  loadCredentials,
} = authSlice.actions;

export default authSlice.reducer;
