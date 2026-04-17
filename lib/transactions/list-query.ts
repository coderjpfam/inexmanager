import mongoose from "mongoose";
import { TransactionModel } from "@/models/Transaction";
import type { TransactionApiRow } from "@/lib/transactions/serialize";
import { serializeTransaction } from "@/lib/transactions/serialize";

export type ListTxQuery = {
  type?: "income" | "expense";
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  page?: number;
  limit?: number;
};

export type ListTxResult = {
  data: TransactionApiRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseYmdStart(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function parseYmdEndExclusive(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
}

export async function listTransactionsForUser(
  userId: string,
  q: ListTxQuery,
): Promise<ListTxResult> {
  const uid = new mongoose.Types.ObjectId(userId);
  const filter: Record<string, unknown> = { userId: uid };

  if (q.type === "income" || q.type === "expense") {
    filter.type = q.type;
  }
  if (q.categoryId && mongoose.isValidObjectId(q.categoryId)) {
    filter.categoryId = new mongoose.Types.ObjectId(q.categoryId);
  }
  if (q.accountId && mongoose.isValidObjectId(q.accountId)) {
    filter.accountId = new mongoose.Types.ObjectId(q.accountId);
  }
  const dateRange: { $gte?: Date; $lt?: Date } = {};
  if (q.startDate && /^\d{4}-\d{2}-\d{2}$/.test(q.startDate)) {
    dateRange.$gte = parseYmdStart(q.startDate);
  }
  if (q.endDate && /^\d{4}-\d{2}-\d{2}$/.test(q.endDate)) {
    dateRange.$lt = parseYmdEndExclusive(q.endDate);
  }
  if (Object.keys(dateRange).length > 0) {
    filter.date = dateRange;
  }
  if (q.search?.trim()) {
    filter.description = {
      $regex: escapeRegex(q.search.trim()),
      $options: "i",
    };
  }

  const page = Math.max(1, q.page ?? 1);
  const limit = Math.min(100, Math.max(1, q.limit ?? 20));
  const skip = (page - 1) * limit;

  const sortKey = q.sort ?? "date_desc";
  const sort: Record<string, 1 | -1> =
    sortKey === "date_asc"
      ? { date: 1, createdAt: 1 }
      : sortKey === "amount_desc"
        ? { amount: -1, date: -1 }
        : sortKey === "amount_asc"
          ? { amount: 1, date: -1 }
          : { date: -1, createdAt: -1 };

  const [rows, total, sums] = await Promise.all([
    TransactionModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    TransactionModel.countDocuments(filter),
    TransactionModel.aggregate<{ _id: string; total: number }>([
      { $match: filter },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const s of sums) {
    if (s._id === "income") totalIncome = s.total;
    if (s._id === "expense") totalExpense = s.total;
  }

  const data = rows.map((r) => serializeTransaction(r as never));

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    summary: {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
    },
  };
}
