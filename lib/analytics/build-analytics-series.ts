import mongoose from "mongoose";
import { AccountModel } from "@/models/Account";
import { TransactionModel } from "@/models/Transaction";
import { monthUtcRange } from "@/lib/analytics/month-range";
import { lastNMonthsAscending } from "@/lib/analytics/months";

export type MonthlyAnalyticsRow = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export type ByCategoryRow = {
  categoryId: string;
  categoryName: string;
  icon: string;
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
};

export type NetWorthRow = {
  month: string;
  netWorth: number;
};

async function sumIncomeExpense(
  userId: mongoose.Types.ObjectId,
  start: Date,
  end: Date,
): Promise<{ income: number; expense: number }> {
  const rows = await TransactionModel.aggregate<{ _id: string; total: number }>([
    {
      $match: {
        userId,
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r._id === "income") income = r.total;
    if (r._id === "expense") expense = r.total;
  }
  return { income, expense };
}

export async function buildMonthlyAnalytics(
  userId: string,
  months: number,
): Promise<MonthlyAnalyticsRow[]> {
  const uid = new mongoose.Types.ObjectId(userId);
  const n = Math.min(24, Math.max(1, months));
  const yms = lastNMonthsAscending(n);
  const out: MonthlyAnalyticsRow[] = [];
  for (const ym of yms) {
    const range = monthUtcRange(ym);
    if (!range) continue;
    const { income, expense } = await sumIncomeExpense(uid, range.start, range.end);
    out.push({ month: ym, income, expense, net: income - expense });
  }
  return out;
}

export async function buildByCategoryBreakdown(
  userId: string,
  type: "income" | "expense",
  start: Date,
  end: Date,
): Promise<{ rows: ByCategoryRow[]; total: number }> {
  const uid = new mongoose.Types.ObjectId(userId);

  const grouped = await TransactionModel.aggregate<{
    _id: mongoose.Types.ObjectId | null;
    categoryName: string;
    total: number;
    count: number;
  }>([
    {
      $match: {
        userId,
        type,
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        categoryName: { $first: "$categoryName" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const total = grouped.reduce((s, g) => s + g.total, 0);
  const rows: ByCategoryRow[] = grouped.map((g) => ({
    categoryId: g._id ? String(g._id) : "",
    categoryName: g.categoryName || "Uncategorized",
    icon: "",
    totalAmount: g.total,
    transactionCount: g.count,
    percentageOfTotal:
      total > 0 ? Math.round((g.total / total) * 1000) / 10 : 0,
  }));

  return { rows, total };
}

/**
 * Net worth trend: cumulative sum of monthly (income − expense) over the window,
 * anchored so the **last** month aligns with current total account balance (when tx history explains balances).
 */
export async function buildNetWorthSeries(
  userId: string,
  months: number,
): Promise<NetWorthRow[]> {
  const monthly = await buildMonthlyAnalytics(userId, months);
  const uid = new mongoose.Types.ObjectId(userId);
  const accounts = await AccountModel.find({
    userId: uid,
    isArchived: false,
  })
    .select({ balance: 1 })
    .lean();
  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const sumNet = monthly.reduce((s, m) => s + m.net, 0);
  let baseline = totalBalance - sumNet;

  const out: NetWorthRow[] = [];
  for (const m of monthly) {
    baseline += m.net;
    out.push({ month: m.month, netWorth: Math.round(baseline) });
  }
  return out;
}
