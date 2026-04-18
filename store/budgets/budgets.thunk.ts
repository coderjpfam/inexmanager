import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "@/store/root-state";
import type { BudgetRow, BudgetsQuery } from "./budgets.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

function monthUtcNow(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export const fetchBudgets = createAsyncThunk<
  { items: BudgetRow[]; query: BudgetsQuery },
  Partial<BudgetsQuery> | void,
  { rejectValue: string; state: RootState }
>("budgets/fetchAll", async (arg, { rejectWithValue, getState }) => {
  const prev = getState().budgets.query;
  const month =
    typeof arg?.month === "string" && /^\d{4}-\d{2}$/.test(arg.month)
      ? arg.month
      : prev.month || monthUtcNow();
  const period =
    arg && "period" in arg && arg.period !== undefined ? arg.period : prev.period;

  const q: BudgetsQuery = { month, ...(period ? { period } : {}) };

  try {
    const params: Record<string, string> = { month: q.month };
    if (q.period) params.period = q.period;

    const res = await apiClient.get<{ success: true; data: BudgetRow[] }>("/api/budgets", {
      params,
    });
    if (!res.data.success) return rejectWithValue("Invalid response");
    return { items: res.data.data, query: q };
  } catch (e) {
    let msg = "Could not load budgets";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export type CreateBudgetInput = {
  categoryId: string;
  limitAmount: number;
  period: "Weekly" | "Monthly" | "Custom";
  alertThreshold?: number;
  customStartDate?: string;
  customEndDate?: string;
};

export const createBudget = createAsyncThunk<
  void,
  CreateBudgetInput,
  { rejectValue: string; state: RootState }
>("budgets/create", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const body: Record<string, unknown> = {
      categoryId: payload.categoryId,
      limitAmount: payload.limitAmount,
      period: payload.period,
    };
    if (payload.alertThreshold !== undefined) body.alertThreshold = payload.alertThreshold;
    if (payload.period === "Custom") {
      body.customStartDate = payload.customStartDate;
      body.customEndDate = payload.customEndDate;
    }

    const res = await apiClient.post<{ success: boolean }>("/api/budgets", body);
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().budgets.query;
    await dispatch(fetchBudgets({ month: q.month })).unwrap();
    if (typeof window !== "undefined") toast.success("Budget created");
  } catch (e) {
    let msg = "Could not create budget";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const deleteBudget = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("budgets/delete", async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await apiClient.delete<{ success: boolean }>(`/api/budgets/${id}`);
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().budgets.query;
    await dispatch(fetchBudgets({ month: q.month })).unwrap();
    if (typeof window !== "undefined") toast.success("Budget deleted");
    return id;
  } catch (e) {
    let msg = "Could not delete budget";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});
