/** UTC calendar month from `YYYY-MM`. Inclusive date bounds for transaction `date` queries. */
export function monthUtcRange(yyyyMm: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  const [y, m] = yyyyMm.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { start, end };
}

/** First seven calendar days of the month (days 1–7), UTC — used for Weekly budget spend in a month view. */
export function firstWeekOfMonthUtc(yyyyMm: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  const [y, m] = yyyyMm.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, 7, 23, 59, 59, 999));
  return { start, end };
}

export function currentMonthUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function intersectDateRanges(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): { start: Date; end: Date } | null {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  if (start > end) return null;
  return { start, end };
}
