import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type {
  AccountOption,
  CategoryOption,
  TransactionsListPayload,
  TransactionsQuery,
  TransactionsSliceState,
} from "./transactions.types";
import type { TransactionApiRow } from "@/lib/transactions/serialize";

type V1Fail = { success: false; error: { message: string; code?: string } };

function sortApi(sort: TransactionsQuery["sort"]): string {
  const m: Record<TransactionsQuery["sort"], string> = {
    "date-desc": "date_desc",
    "date-asc": "date_asc",
    "amount-desc": "amount_desc",
    "amount-asc": "amount_asc",
  };
  return m[sort];
}

function toUiTransaction(row: TransactionApiRow): import("./transactions.types").UiTransaction {
  return {
    id: row._id,
    desc: row.description,
    category: row.categoryName,
    account: row.accountName,
    type: row.type,
    amount: row.amount,
    date: row.date,
  };
}

const defaultQuery: TransactionsQuery = {
  page: 1,
  limit: 50,
  sort: "date-desc",
  search: "",
};

export const fetchTransactions = createAsyncThunk<
  TransactionsListPayload,
  Partial<TransactionsQuery> | void,
  { rejectValue: string }
>("transactions/fetch", async (arg, { rejectWithValue }) => {
  const q: TransactionsQuery = { ...defaultQuery, ...arg };
  try {
    const params: Record<string, string | number> = {
      page: q.page,
      limit: q.limit,
      sort: sortApi(q.sort),
    };
    if (q.search.trim()) params.search = q.search.trim();
    if (q.type) params.type = q.type;

    const res = await apiClient.get<{
      success: true;
      data: TransactionApiRow[];
      pagination: TransactionsListPayload["pagination"];
      summary: TransactionsListPayload["summary"];
    }>("/api/transactions", { params });

    if (!res.data.success) {
      return rejectWithValue("Invalid response");
    }

    return {
      data: res.data.data,
      pagination: res.data.pagination,
      summary: res.data.summary,
      query: q,
    };
  } catch (e) {
    let msg = "Could not load transactions";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const fetchCategories = createAsyncThunk<
  CategoryOption[],
  void,
  { rejectValue: string }
>("transactions/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<{ success: true; data: CategoryOption[] }>(
      "/api/categories",
    );
    if (!res.data.success) return rejectWithValue("Invalid response");
    return res.data.data;
  } catch (e) {
    let msg = "Could not load categories";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    return rejectWithValue(msg);
  }
});

export const fetchAccounts = createAsyncThunk<
  AccountOption[],
  void,
  { rejectValue: string }
>("transactions/fetchAccounts", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<{ success: true; data: AccountOption[] }>(
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
    return rejectWithValue(msg);
  }
});

export type CreateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  date: string;
  notes?: string;
  tags?: string[];
};

export const createTransaction = createAsyncThunk<
  boolean,
  CreateTransactionInput,
  { rejectValue: string; state: { transactions: TransactionsSliceState } }
>("transactions/create", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    await apiClient.post("/api/transactions", {
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      categoryId: payload.categoryId,
      accountId: payload.accountId,
      date: payload.date,
      notes: payload.notes,
      tags: payload.tags,
      isRecurring: false,
      isSplit: false,
    });
    const q = getState().transactions.query;
    await dispatch(fetchTransactions(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Transaction added");
    return true;
  } catch (e) {
    let msg = "Could not add transaction";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const deleteTransaction = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string; state: { transactions: TransactionsSliceState } }
>("transactions/delete", async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    await apiClient.delete(`/api/transactions/${id}`);
    const q = getState().transactions.query;
    await dispatch(fetchTransactions(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Transaction removed");
    return true;
  } catch (e) {
    let msg = "Could not delete transaction";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export function mapRowsToUi(rows: TransactionApiRow[]) {
  return rows.map(toUiTransaction);
}
