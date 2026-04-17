import mongoose from "mongoose";
import { AccountModel } from "@/models/Account";
import { BudgetModel } from "@/models/Budget";
import { LendingModel } from "@/models/LendingRecord";
import { SavingGoalModel } from "@/models/SavingGoal";
import { TransactionModel } from "@/models/Transaction";
import {
  formatDateYmd,
  monthUtcRange,
  pctChange,
  previousMonthYm,
} from "@/lib/analytics/month-range";

export type DashboardTransactionRow = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId?: string;
  categoryName: string;
  accountId?: string;
  accountName: string;
  date: string;
  isRecurring: boolean;
  isSplit: boolean;
  createdAt: string;
};

export type DashboardBudgetCard = {
  categoryName: string;
  categoryIcon?: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: "on_track" | "near_limit" | "exceeded";
  alertThreshold: number;
};

export type DashboardAccountPreview = {
  _id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  isArchived: boolean;
  createdAt: string;
};

export type DashboardSavingPreview = {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  status: string;
  targetDate?: string;
};

export type DashboardPayload = {
  period: string;
  income: { total: number; change: number };
  expense: { total: number; change: number };
  savings: { totalSaved: number; activeGoals: number };
  net: number;
  accounts: {
    totalBalance: number;
    count: number;
    items: DashboardAccountPreview[];
  };
  budgets: {
    total: number;
    exceeded: number;
    nearLimit: number;
    overview: DashboardBudgetCard[];
  };
  lending: { totalOutstanding: number; overdueCount: number };
  recentTransactions: DashboardTransactionRow[];
  savingGoals: DashboardSavingPreview[];
};

async function sumTxByType(
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

function budgetStatus(
  spent: number,
  limit: number,
  alertThreshold: number,
): "on_track" | "near_limit" | "exceeded" {
  if (limit <= 0) return "on_track";
  const pct = (spent / limit) * 100;
  if (spent > limit) return "exceeded";
  if (pct >= alertThreshold) return "near_limit";
  return "on_track";
}

export async function buildDashboardPayload(
  userId: string,
  month: string,
): Promise<DashboardPayload | { error: string }> {
  const range = monthUtcRange(month);
  if (!range) return { error: "Invalid month. Use YYYY-MM." };

  const prevYm = previousMonthYm(month);
  const prevRange = prevYm ? monthUtcRange(prevYm) : null;

  const uid = new mongoose.Types.ObjectId(userId);
  const { start, end } = range;

  const [currTotals, prevTotals] = await Promise.all([
    sumTxByType(uid, start, end),
    prevRange ? sumTxByType(uid, prevRange.start, prevRange.end) : Promise.resolve({ income: 0, expense: 0 }),
  ]);

  const recentRaw = await TransactionModel.find({
    userId: uid,
    date: { $gte: start, $lt: end },
  })
    .sort({ date: -1, createdAt: -1 })
    .limit(5)
    .lean();

  const recentTransactions: DashboardTransactionRow[] = recentRaw.map((t) => ({
    _id: String(t._id),
    type: t.type,
    amount: t.amount,
    description: t.description,
    categoryId: t.categoryId ? String(t.categoryId) : undefined,
    categoryName: t.categoryName,
    accountId: t.accountId ? String(t.accountId) : undefined,
    accountName: t.accountName,
    date: formatDateYmd(new Date(t.date)),
    isRecurring: Boolean(t.isRecurring),
    isSplit: Boolean(t.isSplit),
    createdAt: new Date(t.createdAt).toISOString(),
  }));

  const accounts = await AccountModel.find({
    userId: uid,
    isArchived: false,
  })
    .sort({ balance: -1 })
    .limit(8)
    .lean();

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const accountCount = await AccountModel.countDocuments({
    userId: uid,
    isArchived: false,
  });

  const items: DashboardAccountPreview[] = accounts.map((a) => ({
    _id: String(a._id),
    name: a.name,
    type: a.type,
    balance: a.balance,
    currency: a.currency ?? "INR",
    institution: a.institution,
    isArchived: a.isArchived,
    createdAt: new Date(a.createdAt).toISOString(),
  }));

  const goals = await SavingGoalModel.find({ userId: uid }).lean();
  const totalSaved = goals.reduce((s, g) => s + (g.savedAmount ?? 0), 0);
  const activeGoals = goals.filter((g) => g.status === "Active").length;

  const savingGoals: DashboardSavingPreview[] = goals.slice(0, 8).map((g) => ({
    _id: String(g._id),
    name: g.name,
    targetAmount: g.targetAmount,
    savedAmount: g.savedAmount ?? 0,
    status: g.status,
    targetDate: g.targetDate ? formatDateYmd(new Date(g.targetDate)) : undefined,
  }));

  const budgets = await BudgetModel.find({ userId: uid, isActive: true }).lean();

  const overview: DashboardBudgetCard[] = [];
  let exceeded = 0;
  let nearLimit = 0;

  for (const b of budgets) {
    const spentAgg = await TransactionModel.aggregate<{ total: number }>([
      {
        $match: {
          userId: uid,
          type: "expense",
          categoryId: b.categoryId,
          date: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const spentAmount = spentAgg[0]?.total ?? 0;
    const limitAmount = b.limitAmount;
    const remainingAmount = Math.max(0, limitAmount - spentAmount);
    const percentageUsed =
      limitAmount > 0 ? Math.round((spentAmount / limitAmount) * 1000) / 10 : 0;
    const status = budgetStatus(spentAmount, limitAmount, b.alertThreshold ?? 75);
    if (status === "exceeded") exceeded += 1;
    if (status === "near_limit") nearLimit += 1;
    overview.push({
      categoryName: b.categoryName,
      categoryIcon: b.categoryIcon,
      limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      status,
      alertThreshold: b.alertThreshold ?? 75,
    });
  }

  const now = new Date();
  const lendRows = await LendingModel.find({ userId: uid }).lean();

  let totalOutstanding = 0;
  for (const r of lendRows) {
    if (r.direction !== "lend" || r.status === "Settled") continue;
    const remaining = Math.max(0, (r.totalAmount ?? 0) - (r.paidAmount ?? 0));
    totalOutstanding += remaining;
  }

  const overdueCount = lendRows.filter((r) => {
    const remaining = Math.max(0, (r.totalAmount ?? 0) - (r.paidAmount ?? 0));
    if (remaining <= 0) return false;
    if (r.status === "Overdue") return true;
    if (r.status === "Active" && new Date(r.dueDate) < now) return true;
    return false;
  }).length;

  const net = currTotals.income - currTotals.expense;

  return {
    period: month,
    income: {
      total: currTotals.income,
      change: pctChange(currTotals.income, prevTotals.income),
    },
    expense: {
      total: currTotals.expense,
      change: pctChange(currTotals.expense, prevTotals.expense),
    },
    savings: {
      totalSaved,
      activeGoals,
    },
    net,
    accounts: {
      totalBalance,
      count: accountCount,
      items,
    },
    budgets: {
      total: budgets.length,
      exceeded,
      nearLimit,
      overview: overview.slice(0, 8),
    },
    lending: {
      totalOutstanding: Math.round(totalOutstanding),
      overdueCount,
    },
    recentTransactions,
    savingGoals,
  };
}
