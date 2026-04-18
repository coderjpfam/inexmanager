export type SavingStatus = "Active" | "Paused" | "Completed";

export function formatDateYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

/** Calendar days from today (UTC) to target date inclusive of target; 0 if target is in the past. */
export function daysRemainingToTarget(targetDate: Date | undefined | null): number {
  if (!targetDate) return 0;
  const today = startOfUtcDay(new Date());
  const end = startOfUtcDay(targetDate);
  const diff = end - today;
  if (diff < 0) return 0;
  return Math.ceil(diff / 86400000);
}

export function deriveSavingMetrics(
  targetAmount: number,
  savedAmount: number,
  targetDate: Date | undefined | null,
) {
  const s = targetAmount > 0 ? Math.min(savedAmount, targetAmount) : savedAmount;
  const remainingAmount = Math.max(0, targetAmount - s);
  const percentageComplete =
    targetAmount > 0 ? Math.min(100, Math.round((s / targetAmount) * 100)) : savedAmount > 0 ? 100 : 0;
  const daysRemaining = daysRemainingToTarget(targetDate ?? undefined);
  const requiredPerDay =
    daysRemaining > 0 && remainingAmount > 0 ? Math.ceil(remainingAmount / daysRemaining) : 0;

  return {
    savedAmount: s,
    remainingAmount,
    percentageComplete,
    daysRemaining,
    requiredPerDay,
  };
}
