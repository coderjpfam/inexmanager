import { deriveLendingMetrics, formatDateYmd, isOverdueDue, type LendingDirection, type LendingStatus } from "./metrics";

export type LendingLean = {
  _id: unknown;
  direction: LendingDirection;
  personName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  note?: string;
  status: LendingStatus;
  payments?: Array<{ amount: number; date: Date; note?: string }>;
  createdAt?: Date;
};

export function lendingToListRow(r: LendingLean) {
  const m = deriveLendingMetrics(r.totalAmount, r.paidAmount);
  const overdue = isOverdueDue(r.dueDate, r.status);
  return {
    _id: String(r._id),
    direction: r.direction,
    personName: r.personName,
    totalAmount: r.totalAmount,
    paidAmount: m.paidAmount,
    remainingAmount: m.remainingAmount,
    percentagePaid: m.percentagePaid,
    dueDate: formatDateYmd(r.dueDate),
    isOverdue: overdue,
    ...(r.note ? { note: r.note } : {}),
    status: r.status,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
  };
}

export function paymentToJson(p: { amount: number; date: Date; note?: string }) {
  return {
    amount: p.amount,
    date: formatDateYmd(p.date),
    ...(p.note ? { note: p.note } : {}),
  };
}

export function lendingToDetail(r: LendingLean) {
  const list = lendingToListRow(r);
  const payments = [...(r.payments ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return {
    ...list,
    payments: payments.map(paymentToJson),
  };
}
