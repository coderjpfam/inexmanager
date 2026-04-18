import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type { RootState } from "@/store/root-state";
import type { CategoriesQuery, CategoryListItem } from "./categories.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

export const fetchCategories = createAsyncThunk<
  { items: CategoryListItem[]; count: number; query: CategoriesQuery },
  Partial<CategoriesQuery> | void,
  { rejectValue: string; state: RootState }
>("categories/fetchAll", async (arg, { rejectWithValue, getState }) => {
  const prev = getState().categories.query;
  let q: CategoriesQuery;
  if (arg && Object.keys(arg).length === 0) {
    q = {};
  } else if (!arg) {
    q = prev;
  } else {
    const type = arg.type !== undefined ? arg.type : prev.type;
    q = type ? { type } : {};
  }

  try {
    const params: Record<string, string> = {};
    if (q.type) params.type = q.type;

    const res = await apiClient.get<{
      success: true;
      data: CategoryListItem[];
      count: number;
    }>("/api/categories", { params });

    if (!res.data.success) return rejectWithValue("Invalid response");
    return {
      items: res.data.data,
      count: res.data.count,
      query: q,
    };
  } catch (e) {
    let msg = "Could not load categories";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export type CreateCategoryInput = {
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
};

export const createCategory = createAsyncThunk<void, CreateCategoryInput, { rejectValue: string; state: RootState }>(
  "categories/create",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.post<{ success: boolean }>("/api/categories", {
        name: payload.name,
        type: payload.type,
        ...(payload.icon ? { icon: payload.icon } : {}),
        ...(payload.color ? { color: payload.color } : {}),
      });
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().categories.query;
      await dispatch(fetchCategories(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Category created");
    } catch (e) {
      let msg = "Could not create category";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const updateCategory = createAsyncThunk<
  void,
  { id: string; name?: string; icon?: string; color?: string; type?: "income" | "expense" },
  { rejectValue: string; state: RootState }
>("categories/update", async (payload, { dispatch, getState, rejectWithValue }) => {
  try {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.icon !== undefined) body.icon = payload.icon;
    if (payload.color !== undefined) body.color = payload.color;
    if (payload.type !== undefined) body.type = payload.type;

    const res = await apiClient.patch<{ success: boolean }>(`/api/categories/${payload.id}`, body);
    if (!res.data.success) return rejectWithValue("Invalid response");
    const q = getState().categories.query;
    await dispatch(fetchCategories(q)).unwrap();
    if (typeof window !== "undefined") toast.success("Category updated");
  } catch (e) {
    let msg = "Could not update category";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const deleteCategory = createAsyncThunk<void, string, { rejectValue: string; state: RootState }>(
  "categories/delete",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/api/categories/${id}`);
      if (!res.data.success) return rejectWithValue("Invalid response");
      const q = getState().categories.query;
      await dispatch(fetchCategories(q)).unwrap();
      if (typeof window !== "undefined") toast.success("Category deleted");
    } catch (e) {
      let msg = "Could not delete category";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data as V1Fail | undefined;
        if (d?.error?.message) msg = d.error.message;
      }
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);
