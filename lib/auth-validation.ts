export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export type PasswordStrength = {
  score: number;
  hasLen: boolean;
  hasUpper: boolean;
  hasNum: boolean;
  hasSpec: boolean;
};

export function measurePasswordStrength(val: string): PasswordStrength {
  const hasLen = val.length >= 8;
  const hasUpper = /[A-Z]/.test(val);
  const hasNum = /[0-9]/.test(val);
  const hasSpec = /[^A-Za-z0-9]/.test(val);
  const score = [hasLen, hasUpper, hasNum, hasSpec].filter(Boolean).length;
  return { score, hasLen, hasUpper, hasNum, hasSpec };
}

const STRENGTH_COLORS = ["#ff6b6b", "#f59e0b", "#6c63ff", "#00c896"] as const;
const STRENGTH_LABELS = ["Too weak", "Fair", "Good", "Strong"] as const;

export function strengthMeta(score: number): {
  label: string;
  color: string;
  fills: [boolean, boolean, boolean, boolean];
} {
  if (score <= 0) {
    return {
      label: "Too weak",
      color: "var(--auth-muted)",
      fills: [false, false, false, false],
    };
  }
  const idx = Math.min(score - 1, 3);
  const fills: [boolean, boolean, boolean, boolean] = [
    score >= 1,
    score >= 2,
    score >= 3,
    score >= 4,
  ];
  return {
    label: STRENGTH_LABELS[idx],
    color: STRENGTH_COLORS[idx],
    fills,
  };
}
