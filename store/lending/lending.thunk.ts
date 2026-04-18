import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "@/store/root-state";
import type { LendingListItem, LendingQuery, LendingSummary } from "./lending.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

export const fetchLending = createAsyncThunk<
  { items: LendingListItem[]; count: number; summary: LendingSummary; query: LendingQuery },
  Partial<LendingQuery> | void,
  { rejectValue: string; state: RootState }
>("lending/fetchAll", async (arg, { rejectWithValue, getState }) => {
  const prev = getState().lending.query;
  let q: LendingQuery;
  if (arg && Object.keys(arg).length === 0) {
    q = {};
  } else if (!arg) {
    q = prev;
  } else {
    const direction = arg.direction !== undefined ? arg.direction : prev.direction;
    const status = arg.status !== undefined ? arg.status : prev.status;
    q = {
      ...(direction ? { direction } : {}),
      ...(status ? { status } : {}),
    };
  }

  try {
    const params: Record<string, string> = {};
    if (q.direction) params.direction = q.direction;
    if (q.status) params.status = q.status;

    const res = await apiClient.get<{
      success: true;
      data: LendingListItem[];
      count: number;
      summary: LendingSummary;
    }>("/api/lending", { params });

    if (!res.data.success) return rejectWithValue("Invalid response");
    return {
      items: res.data.data,
      count: res.data.count,
      summary: res.data.summary,
      query: q,
    };
  } catch (e) {
    let msg = "Could not load lending records";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export type CreateLendingInput = {
  direction: "lend" | "borrow";
  personName: string;
  totalAmount: number;
  dueDate: string;
  note?: string;
};

export const createLending = createAsyncThunk<void, CreateLendingInput, { rejectValue: string; state: RootState }>(
  "lending/create",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean }>("/api/lending", {
        direction: payload.direction,
        personName: payload.personName,
        totalAmount: payload.totalAmount,
        dueDate: payload.dueDate,
        ...(payload.note ? { note: payload.note } : {}),
      });
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().lending.query;
      await dispatch(fetchLending(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Record saved");
    } catch (e) {
      let msg = "Could not create record";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const payLending = createAsyncThunk<
  void,
  { id: string; amount: number; date: string; note?: string },
  { rejectValue: string; state: RootState }
>("lending/pay", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/api/lending/${payload.id}/pay`, {
      amount: payload.amount,
      date: payload.date,
      ...(payload.note ? { note: payload.note } : {}),
    });
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().lending.query;
    await dispatch(fetchLending(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Payment recorded");
  } catch (e) {
    let msg = "Could not record payment";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const settleLending = createAsyncThunk<void, { id: string; note?: string }, { rejectValue: string; state: RootState }>(
  "lending/settle",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/lending/${payload.id}/settle`,
        payload.note ? { note: payload.note } : {},
      );
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().lending.query;
      await dispatch(fetchLending(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Marked settled");
    } catch (e) {
      let msg = "Could not settle";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const deleteLending = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  "lending/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/api/lending/${id}`);
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().lending.query;
      await dispatch(fetchLending(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Record deleted");
    } catch (e) {
      let msg = "Could not delete";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);
