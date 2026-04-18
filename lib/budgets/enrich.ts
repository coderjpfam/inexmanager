import type { BudgetStatus } from "./types";

export function budgetStatus(
  spentAmount: number,
  limitAmount: number,
  alertThreshold: number,
): BudgetStatus {
  if (limitAmount <= 0) {
    return spentAmount > 0 ? "exceeded" : "on_track";
  }
  if (spentAmount >= limitAmount) return "exceeded";
  const pct = (spentAmount / limitAmount) * 100;
  if (pct >= alertThreshold) return "near_limit";
  return "on_track";
}

export function deriveBudgetMetrics(spentAmount: number, limitAmount: number) {
  const remainingAmount = Math.max(0, limitAmount - spentAmount);
  const percentageUsed =
    limitAmount > 0
      ? Math.min(100, Math.round((spentAmount / limitAmount) * 100))
      : spentAmount > 0
        ? 100
        : 0;
  return { remainingAmount, percentageUsed };
}
