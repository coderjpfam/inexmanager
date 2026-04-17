import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import type {
  ByCategoryRow,
  MonthlyAnalyticsRow,
  NetWorthRow,
} from "@/lib/analytics/build-analytics-series";
import { currentMonthYmLocal } from "@/lib/analytics/months";
import type { AnalyticsBundle, ByCategoryState } from "./analytics.types";

type V1Fail = { success: false; error: { message: string; code?: string } };

type MonthlyRes = { success: true; data: MonthlyAnalyticsRow[] };
type NetWorthRes = { success: true; data: NetWorthRow[] };
type ByCategoryResExpense = {
  success: true;
  data: ByCategoryRow[];
  totalExpense: number;
};
type ByCategoryResIncome = {
  success: true;
  data: ByCategoryRow[];
  totalIncome: number;
};

export type FetchAnalyticsArgs = {
  monthlyMonths?: number;
  categoryMonth?: string;
  categoryType?: "income" | "expense";
  netWorthMonths?: number;
};

export const fetchAnalyticsBundle = createAsyncThunk<
  AnalyticsBundle,
  FetchAnalyticsArgs | void,
  { rejectValue: string }
>("analytics/fetchBundle", async (arg, { rejectWithValue }) => {
  const monthlyMonths = arg?.monthlyMonths ?? 6;
  const categoryMonth = arg?.categoryMonth ?? currentMonthYmLocal();
  const categoryType = arg?.categoryType ?? "expense";
  const netWorthMonths = arg?.netWorthMonths ?? 12;

  try {
    const [moRes, catRes, nwRes] = await Promise.all([
      apiClient.get<MonthlyRes>("/api/analytics/monthly", {
        params: { months: monthlyMonths },
      }),
      apiClient.get<ByCategoryResExpense | ByCategoryResIncome>(
        "/api/analytics/by-category",
        { params: { type: categoryType, month: categoryMonth } },
      ),
      apiClient.get<NetWorthRes>("/api/analytics/net-worth", {
        params: { months: netWorthMonths },
      }),
    ]);

    const mo = moRes.data;
    const cat = catRes.data;
    const nw = nwRes.data;

    if (!mo.success || !cat.success || !nw.success) {
      const msg = "Invalid analytics response";
      if (typeof window !== "undefined") toast.error(msg);
      return rejectWithValue(msg);
    }

    const byCategory: ByCategoryState =
      categoryType === "expense"
        ? {
            type: "expense",
            data: (cat as ByCategoryResExpense).data,
            totalExpense: (cat as ByCategoryResExpense).totalExpense,
          }
        : {
            type: "income",
            data: (cat as ByCategoryResIncome).data,
            totalIncome: (cat as ByCategoryResIncome).totalIncome,
          };

    return {
      monthly: mo.data,
      byCategory,
      netWorth: nw.data,
    };
  } catch (e) {
    let msg = "Could not load analytics";
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as V1Fail | undefined;
      if (d?.error?.message) msg = d.error.message;
    }
    if (typeof window !== "undefined") toast.error(msg);
    return rejectWithValue(msg);
  }
});
