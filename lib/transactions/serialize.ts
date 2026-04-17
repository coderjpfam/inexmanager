import type { TransactionDoc } from "@/models/Transaction";

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type TransactionApiRow = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId?: string;
  categoryName: string;
  accountId?: string;
  accountName: string;
  date: string;
  notes?: string;
  tags?: string[];
  isRecurring: boolean;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
};

export function serializeTransaction(doc: TransactionDoc | Record<string, unknown>): TransactionApiRow {
  const d = doc as TransactionDoc;
  return {
    _id: String(d._id),
    type: d.type,
    amount: d.amount,
    description: d.description,
    categoryId: d.categoryId ? String(d.categoryId) : undefined,
    categoryName: d.categoryName ?? "",
    accountId: d.accountId ? String(d.accountId) : undefined,
    accountName: d.accountName ?? "",
    date: ymd(new Date(d.date)),
    notes: d.notes,
    tags: d.tags,
    isRecurring: Boolean(d.isRecurring),
    isSplit: Boolean(d.isSplit),
    createdAt: new Date(d.createdAt).toISOString(),
    updatedAt: new Date(
      d.updatedAt && !Number.isNaN(new Date(d.updatedAt).getTime())
        ? d.updatedAt
        : d.createdAt,
    ).toISOString(),
  };
}
