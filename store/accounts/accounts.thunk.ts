import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type {
  AccountListItem,
  AccountsSummary,
  CreateAccountInput,
  UpdateAccountInput,
} from "./accounts.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

export const fetchAccounts = createAsyncThunk<
  AccountListItem[],
  void,
  { rejectValue: string }
>("accounts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<{ success: true; data: AccountListItem[] }>(
      "/api/accounts",
    );
    if (!res.data.success) return rejectWithValue("Invalid response");
    return res.data.data;
  } catch (e) {
    let msg = "Could not load accounts";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const fetchAccountsSummary = createAsyncThunk<
  AccountsSummary,
  void,
  { rejectValue: string }
>("accounts/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<{ success: true; data: AccountsSummary }>(
      "/api/accounts/summary",
    );
    if (!res.data.success) return rejectWithValue("Invalid response");
    return res.data.data;
  } catch (e) {
    let msg = "Could not load account summary";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const createAccount = createAsyncThunk<
  void,
  CreateAccountInput,
  { rejectValue: string }
>("accounts/create", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await apiClient.post<{ success: boolean }>("/api/accounts", {
      name: payload.name,
      type: payload.type,
      balance: payload.balance ?? 0,
      currency: payload.currency ?? "INR",
      institution: payload.institution,
      accountNumber: payload.accountNumber,
    });
    if (!res.data.success) return rejectWithValue("Invalid response");
    await dispatch(fetchAccounts()).unwrap();
    await dispatch(fetchAccountsSummary()).unwrap();
    if (typeof window !== "undefined") toast.success("Account added");
  } catch (e) {
    let msg = "Could not create account";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const updateAccount = createAsyncThunk<void, UpdateAccountInput, { rejectValue: string }>(
  "accounts/update",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const body: Record<string, unknown> = {};
      if (payload.name !== undefined) body.name = payload.name;
      if (payload.balance !== undefined) body.balance = payload.balance;
      if (payload.institution !== undefined) body.institution = payload.institution;
      if (payload.accountNumber !== undefined) body.accountNumber = payload.accountNumber;
      if (payload.currency !== undefined) body.currency = payload.currency;
      if (payload.type !== undefined) body.type = payload.type;

      const res = await apiClient.patch<{ success: boolean }>(`/api/accounts/${payload.id}`, body);
      if (!res.data.success) return rejectWithValue("Invalid response");
      await dispatch(fetchAccounts()).unwrap();
      await dispatch(fetchAccountsSummary()).unwrap();
      if (typeof window !== "undefined") toast.success("Account updated");
    } catch (e) {
      let msg = "Could not update account";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const archiveAccount = createAsyncThunk<void, string, { rejectValue: string }>(
  "accounts/archive",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/api/accounts/${id}`);
      if (!res.data.success) return rejectWithValue("Invalid response");
      await dispatch(fetchAccounts()).unwrap();
      await dispatch(fetchAccountsSummary()).unwrap();
      if (typeof window !== "undefined") toast.success("Account archived");
    } catch (e) {
      let msg = "Could not archive account";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);
