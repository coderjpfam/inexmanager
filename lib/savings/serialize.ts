import { deriveSavingMetrics, formatDateYmd } from "./metrics";
import type { SavingStatus } from "./metrics";

export type SavingGoalLean = {
  _id: unknown;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: Date;
  status: SavingStatus;
  icon?: string;
  notes?: string;
  contributions?: Array<{ amount: number; date: Date; note?: string }>;
  createdAt?: Date;
};

export function savingToListRow(g: SavingGoalLean) {
  const m = deriveSavingMetrics(g.targetAmount, g.savedAmount, g.targetDate);
  return {
    _id: String(g._id),
    name: g.name,
    targetAmount: g.targetAmount,
    savedAmount: m.savedAmount,
    percentageComplete: m.percentageComplete,
    remainingAmount: m.remainingAmount,
    targetDate: g.targetDate ? formatDateYmd(g.targetDate) : undefined,
    daysRemaining: m.daysRemaining,
    requiredPerDay: m.requiredPerDay,
    status: g.status,
    ...(g.icon ? { icon: g.icon } : {}),
    createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : undefined,
  };
}

export function contributionToJson(c: { amount: number; date: Date; note?: string }) {
  return {
    amount: c.amount,
    date: formatDateYmd(c.date),
    ...(c.note ? { note: c.note } : {}),
  };
}

export function savingToDetail(g: SavingGoalLean) {
  const list = savingToListRow(g);
  const contributions = [...(g.contributions ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return {
    ...list,
    icon: g.icon,
    notes: g.notes,
    contributions: contributions.map(contributionToJson),
  };
}
