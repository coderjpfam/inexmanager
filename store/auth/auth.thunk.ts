import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type {
  ApiErrorBody,
  ApiSuccess,
  AuthTokenResponse,
  AuthUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  ValidateTokenPayload,
} from "./auth.types";

function rejectMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

function toastSuccess(message: string) {
  if (typeof window !== "undefined") toast.success(message);
}

function toastError(message: string) {
  if (typeof window !== "undefined") toast.error(message);
}

export const signIn = createAsyncThunk<
  AuthTokenResponse,
  SignInPayload,
  { rejectValue: string }
>("auth/signIn", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiSuccess<AuthTokenResponse>>(
      "/api/auth/signin",
      {
        email: payload.email,
        password: payload.password,
      },
    );
    toastSuccess("Signed in successfully");
    return { token: data.token, user: data.user };
  } catch (e) {
    const msg = rejectMessage(e, "Sign in failed");
    toastError(msg);
    return rejectWithValue(msg);
  }
});

export const signUp = createAsyncThunk<
  AuthTokenResponse,
  SignUpPayload,
  { rejectValue: string }
>("auth/signUp", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiSuccess<AuthTokenResponse>>(
      "/api/auth/signup",
      {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      },
    );
    toastSuccess("Account created. You’re signed in.");
    return { token: data.token, user: data.user };
  } catch (e) {
    const msg = rejectMessage(e, "Sign up failed");
    toastError(msg);
    return rejectWithValue(msg);
  }
});

export const forgotPassword = createAsyncThunk<
  { message: string },
  ForgotPasswordPayload,
  { rejectValue: string }
>("auth/forgotPassword", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiSuccess<{ message: string }>>(
      "/api/auth/forgot-password",
      { email: payload.email },
    );
    toastSuccess(data.message);
    return { message: data.message };
  } catch (e) {
    const msg = rejectMessage(e, "Could not send reset email");
    toastError(msg);
    return rejectWithValue(msg);
  }
});

export const resetPassword = createAsyncThunk<
  { message: string },
  ResetPasswordPayload,
  { rejectValue: string }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiSuccess<{ message: string }>>(
      "/api/auth/reset-password",
      {
        token: payload.token,
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
      },
    );
    toastSuccess(data.message || "Password updated successfully");
    return { message: data.message };
  } catch (e) {
    const msg = rejectMessage(e, "Could not reset password");
    toastError(msg);
    return rejectWithValue(msg);
  }
});

export const validateToken = createAsyncThunk<
  { user: AuthUser; token: string },
  ValidateTokenPayload,
  { rejectValue: string }
>("auth/validateToken", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<ApiSuccess<{ user: AuthUser }>>(
      "/api/auth/validate-token",
      { token: payload.token },
    );
    return { user: data.user, token: payload.token };
  } catch (e) {
    const msg = rejectMessage(e, "Token validation failed");
    return rejectWithValue(msg);
  }
});
