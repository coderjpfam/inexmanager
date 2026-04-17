/** Last `count` calendar months ending at current month, ascending (oldest first). */
export function lastNMonthsAscending(count: number): string[] {
  const end = new Date();
  const list: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    list.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return list;
}

export function shortMonthLabel(ym: string): string {
  const p = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!p) return ym;
  const y = Number(p[1]);
  const m = Number(p[2]) - 1;
  const d = new Date(y, m, 1);
  return d.toLocaleString("en-IN", { month: "short" });
}

export function currentMonthYmLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
