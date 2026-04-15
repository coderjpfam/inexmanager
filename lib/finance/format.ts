export function fmt(n: number): string {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.min(100, Math.round((a / b) * 100));
}
