import axios from "axios";
import { getAuthToken } from "@/lib/auth-token";

/**
 * Shared Axios instance for app API calls (browser: same-origin; SSR: set NEXT_PUBLIC_APP_URL).
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
