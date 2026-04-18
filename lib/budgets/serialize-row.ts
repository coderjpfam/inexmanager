import type mongoose from "mongoose";
import { budgetStatus, deriveBudgetMetrics } from "./enrich";
import { spendRangeForBudget, sumExpenseForCategory } from "./spent";
import type { BudgetPeriod } from "./types";

type LeanBudget = {
  _id: unknown;
  categoryId: unknown;
  categoryName: string;
  categoryIcon?: string;
  limitAmount: number;
  period: BudgetPeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  alertThreshold: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function budgetToApiRow(
  userId: mongoose.Types.ObjectId,
  b: LeanBudget,
  month: string,
) {
  const range = spendRangeForBudget(
    b.period,
    month,
    b.customStartDate ?? null,
    b.customEndDate ?? null,
  );
  const spentAmount = range
    ? await sumExpenseForCategory(
        userId,
        b.categoryId as mongoose.Types.ObjectId,
        range.start,
        range.end,
      )
    : 0;

  const { remainingAmount, percentageUsed } = deriveBudgetMetrics(spentAmount, b.limitAmount);
  const status = budgetStatus(spentAmount, b.limitAmount, b.alertThreshold ?? 75);

  return {
    _id: String(b._id),
    categoryId: String(b.categoryId),
    categoryName: b.categoryName,
    categoryIcon: b.categoryIcon ?? "📁",
    limitAmount: b.limitAmount,
    period: b.period,
    spentAmount,
    remainingAmount,
    percentageUsed,
    status,
    alertThreshold: b.alertThreshold ?? 75,
    isActive: b.isActive,
    ...(b.createdAt ? { createdAt: new Date(b.createdAt).toISOString() } : {}),
  };
}
