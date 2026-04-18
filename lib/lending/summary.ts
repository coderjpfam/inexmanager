import type { LendingLean } from "./serialize";
import { deriveLendingMetrics } from "./metrics";

export type LendingSummary = {
  totalLent: number;
  totalLentRemaining: number;
  totalBorrowed: number;
  totalBorrowedRemaining: number;
  netPosition: number;
};

export function computeLendingSummary(rows: LendingLean[]): LendingSummary {
  let totalLent = 0;
  let totalLentRemaining = 0;
  let totalBorrowed = 0;
  let totalBorrowedRemaining = 0;

  for (const r of rows) {
    const m = deriveLendingMetrics(r.totalAmount, r.paidAmount);
    if (r.direction === "lend") {
      if (r.status !== "Settled") {
        totalLent += r.totalAmount;
        totalLentRemaining += m.remainingAmount;
      }
    } else {
      if (r.status !== "Settled") {
        totalBorrowed += r.totalAmount;
        totalBorrowedRemaining += m.remainingAmount;
      }
    }
  }

  return {
    totalLent,
    totalLentRemaining,
    totalBorrowed,
    totalBorrowedRemaining,
    netPosition: totalLentRemaining - totalBorrowedRemaining,
  };
}
