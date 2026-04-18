import type { BudgetStatus } from "@/lib/budgets/types";

export type BudgetRow = {
  _id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  limitAmount: number;
  period: "Weekly" | "Monthly" | "Custom";
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: BudgetStatus;
  alertThreshold: number;
  isActive: boolean;
  createdAt?: string;
};

export type BudgetsQuery = {
  month: string;
  period?: "Weekly" | "Monthly" | "Custom";
};

export type BudgetsSliceState = {
  items: BudgetRow[];
  query: BudgetsQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
