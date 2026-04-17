import type {
  ByCategoryRow,
  MonthlyAnalyticsRow,
  NetWorthRow,
} from "@/lib/analytics/build-analytics-series";

export type { ByCategoryRow, MonthlyAnalyticsRow, NetWorthRow };

export type ByCategoryState = {
  type: "income" | "expense";
  data: ByCategoryRow[];
  totalExpense?: number;
  totalIncome?: number;
};

export type AnalyticsBundle = {
  monthly: MonthlyAnalyticsRow[];
  byCategory: ByCategoryState;
  netWorth: NetWorthRow[];
};

export type AnalyticsSliceState = {
  bundle: AnalyticsBundle | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
