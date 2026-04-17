"use client";

import { ACCOUNT_COLORS } from "@/lib/finance/constants";
import { fmt, pct } from "@/lib/finance/format";
import { fetchDashboard } from "@/store/dashboard/dashboard.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useCallback, useEffect } from "react";

function currentMonthYm(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function DashboardView() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((s) => s.dashboard);

  const load = useCallback(() => {
    dispatch(fetchDashboard({ month: currentMonthYm() }));
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="main-fade-up space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#2D3149]"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#2D3149]" />
      </div>
    );
  }

  if (status === "failed" || !data) {
    return (
      <div className="main-fade-up rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <p className="text-sm text-[#64748B] dark:text-[#8892B0]">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-xl bg-[#00C896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00A87C]"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = data;
  const net = d.net;
  const recent = d.recentTransactions;
  const budgetRows = d.budgets.overview;
  const accountItems = d.accounts.items;
  const savingItems = d.savingGoals;

  return (
    <div className="main-fade-up space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-income main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Income</div>
          <div className="main-num text-2xl font-bold">{fmt(d.income.total)}</div>
          <div className="mt-1 text-xs opacity-70">
            {d.income.change >= 0 ? "+" : ""}
            {d.income.change}% vs last month
          </div>
        </div>
        <div className="stat-expense main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Expenses</div>
          <div className="main-num text-2xl font-bold">{fmt(d.expense.total)}</div>
          <div className="mt-1 text-xs opacity-70">
            {d.expense.change >= 0 ? "+" : ""}
            {d.expense.change}% vs last month
          </div>
        </div>
        <div className="stat-savings main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Savings</div>
          <div className="main-num text-2xl font-bold">{fmt(d.savings.totalSaved)}</div>
          <div className="mt-1 text-xs opacity-70">
            {d.savings.activeGoals} active goal{d.savings.activeGoals === 1 ? "" : "s"}
          </div>
        </div>
        <div className="stat-net main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Net Balance</div>
          <div className="main-num text-2xl font-bold">{fmt(net)}</div>
          <div className="mt-1 text-xs opacity-70">Income − expenses · {d.period}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Transactions</h3>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-[#00C896] hover:opacity-85"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No transactions this month
              </div>
            ) : (
              recent.map((t) => {
                const icon = t.categoryName ? "📁" : t.type === "income" ? "💰" : "💸";
                const ds = new Date(t.date + "T00:00:00Z").toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div key={t._id} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                        t.type === "income" ? "bg-[#00C89612]" : "bg-[#FF6B6B12]"
                      }`}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.description}</div>
                      <div className="text-xs text-[#64748B] dark:text-[#8892B0]">
                        {t.categoryName} · {ds}
                      </div>
                    </div>
                    <div
                      className={`main-num text-sm font-bold ${
                        t.type === "income" ? "text-[#00C896]" : "text-[#FF6B6B]"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {fmt(t.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Budget Health</h3>
            <Link
              href="/budgets"
              className="text-xs font-semibold text-[#00C896] hover:opacity-85"
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-4">
            {budgetRows.map((b, idx) => {
              const p = Math.min(100, b.percentageUsed);
              const color =
                b.status === "exceeded"
                  ? "#FF6B6B"
                  : b.status === "near_limit"
                    ? "#F59E0B"
                    : "#00C896";
              return (
                <div key={`${b.categoryName}-${idx}`}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">
                      {b.categoryIcon ? `${b.categoryIcon} ` : ""}
                      {b.categoryName}
                    </span>
                    <span
                      className={`main-num ${
                        b.status === "exceeded"
                          ? "text-[#FF6B6B]"
                          : "text-[#64748B] dark:text-[#8892B0]"
                      }`}
                    >
                      {fmt(b.spentAmount)} / {fmt(b.limitAmount)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F0F4F8] dark:bg-[#0F1117]">
                    <div
                      className="main-progress-fill h-full rounded-full"
                      style={{ width: `${p}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
            {budgetRows.length === 0 && (
              <div className="py-4 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No budgets set
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Accounts</h3>
            <Link
              href="/accounts"
              className="text-xs font-semibold text-[#00C896] hover:opacity-85"
            >
              View all →
            </Link>
          </div>
          <div className="mb-3 text-xs text-[#64748B] dark:text-[#8892B0]">
            Total {fmt(d.accounts.totalBalance)} · {d.accounts.count} account
            {d.accounts.count === 1 ? "" : "s"}
          </div>
          <div className="space-y-3">
            {accountItems.length === 0 ? (
              <div className="py-4 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No accounts yet
              </div>
            ) : (
              accountItems.map((a) => (
                <div key={a._id} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                    style={{
                      background: `${ACCOUNT_COLORS[a.type] ?? "#64748B"}22`,
                    }}
                  >
                    {a.type === "Bank"
                      ? "🏦"
                      : a.type === "Cash"
                        ? "💵"
                        : a.type === "Stocks"
                          ? "📈"
                          : "₿"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-[#64748B] dark:text-[#8892B0]">
                      {a.type}
                    </div>
                  </div>
                  <div className="main-num text-sm font-semibold">{fmt(a.balance)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Saving Goals</h3>
            <Link
              href="/savings"
              className="text-xs font-semibold text-[#00C896] hover:opacity-85"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {savingItems.length === 0 ? (
              <div className="py-4 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No saving goals yet
              </div>
            ) : (
              savingItems.map((g) => {
                const p = pct(g.savedAmount, g.targetAmount);
                return (
                  <div key={g._id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{g.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          g.status === "Completed"
                            ? "bg-[#00C89626] text-[#00C896]"
                            : g.status === "Paused"
                              ? "bg-[#64748B26] text-[#64748B]"
                              : "bg-[#3B82F626] text-[#3B82F6]"
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <div className="mb-1 h-2 overflow-hidden rounded-full bg-[#F0F4F8] dark:bg-[#0F1117]">
                      <div
                        className="main-progress-fill h-full rounded-full bg-[#6C63FF]"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#64748B] dark:text-[#8892B0]">
                      <span className="main-num">{fmt(g.savedAmount)}</span>
                      <span className="main-num">{fmt(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-xs text-[#64748B] dark:border-[#2D3149] dark:bg-[#1A1D27] dark:text-[#8892B0]">
        <span className="font-semibold text-[#1E293B] dark:text-[#E2E8F0]">Lending: </span>
        Outstanding (lent) {fmt(d.lending.totalOutstanding)} · Overdue{" "}
        {d.lending.overdueCount}{" "}
        <Link href="/lending" className="ml-2 font-semibold text-[#00C896]">
          Open lending →
        </Link>
      </div>
    </div>
  );
}
