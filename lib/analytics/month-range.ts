/** `month` is `YYYY-MM` (UTC month boundaries). */
export function parseMonthYm(month: string): { y: number; m: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(month.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  return { y, m: mo };
}

export function monthUtcRange(ym: string): { start: Date; end: Date } | null {
  const p = parseMonthYm(ym);
  if (!p) return null;
  const start = new Date(Date.UTC(p.y, p.m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(p.y, p.m, 1, 0, 0, 0, 0));
  return { start, end };
}

export function previousMonthYm(ym: string): string | null {
  const p = parseMonthYm(ym);
  if (!p) return null;
  const d = new Date(Date.UTC(p.y, p.m - 2, 1));
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function currentMonthYm(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
