export type LendingDirection = "lend" | "borrow";
export type LendingStatus = "Active" | "Settled" | "Overdue";

export function formatDateYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

export function deriveLendingMetrics(totalAmount: number, paidAmount: number) {
  const paid = totalAmount > 0 ? Math.min(paidAmount, totalAmount) : paidAmount;
  const remainingAmount = Math.max(0, totalAmount - paid);
  const percentagePaid =
    totalAmount > 0 ? Math.min(100, Math.round((paid / totalAmount) * 100)) : paid > 0 ? 100 : 0;
  return { paidAmount: paid, remainingAmount, percentagePaid };
}

export function isOverdueDue(dueDate: Date, status: LendingStatus): boolean {
  if (status === "Settled") return false;
  const due = startOfUtcDay(dueDate);
  const today = startOfUtcDay(new Date());
  return due < today;
}
