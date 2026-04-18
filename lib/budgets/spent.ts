import { TransactionModel } from "@/models/Transaction";
import type mongoose from "mongoose";
import {
  firstWeekOfMonthUtc,
  intersectDateRanges,
  monthUtcRange,
} from "./spend-range";
import type { BudgetPeriod } from "./types";

export { currentMonthUtc, monthUtcRange } from "./spend-range";

/** Spend window for a budget row given the list view month (`YYYY-MM`). */
export function spendRangeForBudget(
  period: BudgetPeriod,
  month: string,
  customStart?: Date | null,
  customEnd?: Date | null,
): { start: Date; end: Date } | null {
  const monthR = monthUtcRange(month);
  if (!monthR) return null;

  if (period === "Monthly") {
    return monthR;
  }
  if (period === "Weekly") {
    return firstWeekOfMonthUtc(month);
  }
  if (period === "Custom") {
    if (!customStart || !customEnd) return null;
    return intersectDateRanges(
      { start: customStart, end: customEnd },
      monthR,
    );
  }
  return null;
}

export async function sumExpenseForCategory(
  userId: mongoose.Types.ObjectId,
  categoryId: mongoose.Types.ObjectId,
  start: Date,
  end: Date,
): Promise<number> {
  const rows = await TransactionModel.aggregate<{ total: number }>([
    {
      $match: {
        userId,
        type: "expense",
        categoryId,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows[0]?.total ?? 0;
}
