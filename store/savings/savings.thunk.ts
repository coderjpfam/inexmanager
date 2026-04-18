import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "@/store/root-state";
import type { SavingListItem, SavingsQuery } from "./savings.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

export const fetchSavings = createAsyncThunk<
  { items: SavingListItem[]; count: number; totalSaved: number; query: SavingsQuery },
  Partial<SavingsQuery> | void,
  { rejectValue: string; state: RootState }
>("savings/fetchAll", async (arg, { rejectWithValue, getState }) => {
  const prev = getState().savings.query;
  let q: SavingsQuery;
  if (arg && Object.keys(arg).length === 0) {
    q = {};
  } else if (!arg) {
    q = prev;
  } else {
    const status = arg.status !== undefined ? arg.status : prev.status;
    q = status ? { status } : {};
  }

  try {
    const params: Record<string, string> = {};
    if (q.status) params.status = q.status;

    const res = await apiClient.get<{
      success: true;
      data: SavingListItem[];
      count: number;
      totalSaved: number;
    }>("/api/savings", { params });

    if (!res.data.success) return rejectWithValue("Invalid response");
    return {
      items: res.data.data,
      count: res.data.count,
      totalSaved: res.data.totalSaved,
      query: q,
    };
  } catch (e) {
    let msg = "Could not load savings goals";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export type CreateSavingInput = {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  targetDate?: string;
  icon?: string;
  notes?: string;
};

export const createSaving = createAsyncThunk<void, CreateSavingInput, { rejectValue: string; state: RootState }>(
  "savings/create",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean }>("/api/savings", {
        name: payload.name,
        targetAmount: payload.targetAmount,
        savedAmount: payload.savedAmount ?? 0,
        ...(payload.targetDate ? { targetDate: payload.targetDate } : {}),
        ...(payload.icon ? { icon: payload.icon } : {}),
        ...(payload.notes ? { notes: payload.notes } : {}),
      });
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().savings.query;
      await dispatch(fetchSavings(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Goal created");
    } catch (e) {
      let msg = "Could not create goal";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const updateSaving = createAsyncThunk<
  void,
  { id: string; name?: string; targetAmount?: number; status?: "Active" | "Paused" | "Completed" },
  { rejectValue: string; state: RootState }
>("savings/update", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.targetAmount !== undefined) body.targetAmount = payload.targetAmount;
    if (payload.status !== undefined) body.status = payload.status;

    const res = await apiClient.patch<{ success: boolean }>(`/api/savings/${payload.id}`, body);
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().savings.query;
    await dispatch(fetchSavings(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Goal updated");
  } catch (e) {
    let msg = "Could not update goal";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const contributeSaving = createAsyncThunk<
  void,
  { id: string; amount: number; date: string; note?: string },
  { rejectValue: string; state: RootState }
>("savings/contribute", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/api/savings/${payload.id}/contribute`, {
      amount: payload.amount,
      date: payload.date,
      ...(payload.note ? { note: payload.note } : {}),
    });
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().savings.query;
    await dispatch(fetchSavings(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Contribution recorded");
  } catch (e) {
    let msg = "Could not add contribution";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const deleteSaving = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  "savings/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/api/savings/${id}`);
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().savings.query;
      await dispatch(fetchSavings(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Goal deleted");
    } catch (e) {
      let msg = "Could not delete goal";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);
