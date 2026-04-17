import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  validateToken,
} from "./auth.thunk";
import type { AuthUser } from "./auth.types";

export type AuthSliceState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  forgotMessage: string | null;
  resetMessage: string | null;
};

const initialState: AuthSliceState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  forgotMessage: null,
  resetMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.forgotMessage = null;
      state.resetMessage = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearForgotMessage(state) {
      state.forgotMessage = null;
    },
    clearResetMessage(state) {
      state.resetMessage = null;
    },
    setSession(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthSliceState) => {
      state.loading = true;
      state.error = null;
    };
    const settled = (state: AuthSliceState) => {
      state.loading = false;
    };

    builder
      .addCase(signIn.pending, pending)
      .addCase(signIn.fulfilled, (state, action) => {
        settled(state);
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signIn.rejected, (state, action) => {
        settled(state);
        state.error = action.payload ?? action.error.message ?? "Sign in failed";
      })
      .addCase(signUp.pending, pending)
      .addCase(signUp.fulfilled, (state, action) => {
        settled(state);
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signUp.rejected, (state, action) => {
        settled(state);
        state.error = action.payload ?? action.error.message ?? "Sign up failed";
      })
      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        settled(state);
        state.forgotMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        settled(state);
        state.error =
          action.payload ?? action.error.message ?? "Could not send reset email";
      })
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        settled(state);
        state.resetMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        settled(state);
        state.error =
          action.payload ?? action.error.message ?? "Could not reset password";
      })
      .addCase(validateToken.pending, pending)
      .addCase(validateToken.fulfilled, (state, action) => {
        settled(state);
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(validateToken.rejected, (state, action) => {
        settled(state);
        state.error =
          action.payload ?? action.error.message ?? "Token validation failed";
      });
  },
});

export const {
  logout,
  clearError,
  clearForgotMessage,
  clearResetMessage,
  setSession,
} = authSlice.actions;

export default authSlice.reducer;
