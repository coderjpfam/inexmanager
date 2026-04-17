import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { DashboardPayload } from "@/lib/analytics/build-dashboard";

type V1Ok<T> = { success: true; data: T };
type V1Fail = { success: false; error: { message: string; code?: string } };

export const fetchDashboard = createAsyncThunk<
  DashboardPayload,
  { month?: string } | void,
  { rejectValue: string }
>("dashboard/fetchDashboard", async (arg, { rejectWithValue }) => {
  const month =
    arg && typeof arg === "object" && typeof arg.month === "string"
      ? arg.month
      : undefined;
  try {
    const res = await apiClient.get<V1Ok<DashboardPayload> | V1Fail>(
      "/api/analytics/dashboard",
      { params: month ? { month } : {} },
    );
    const body = res.data;
    if (!body.success) {
      const msg = "error" in body ? body.error.message : "Invalid response";
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
    return body.data;
  } catch (e) {
    let msg = "Could not load dashboard";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d && "error" in d && d.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});
