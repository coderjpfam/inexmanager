"use client";

import { ACCOUNT_COLORS } from "@/lib/finance/constants";
import { useFinance } from "@/components/main/finance-provider";
import Link from "next/link";

export function DashboardView() {
  const {
    transactions,
    budgets,
    accounts,
    savings,
    categories,
    fmt,
    pct,
    totalIncome,
    totalExpense,
    totalSavings,
    expenseByCategory,
    deleteTransaction,
  } = useFinance();

  const inc = totalIncome();
  const exp = totalExpense();
  const net = inc - exp;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="main-fade-up space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-income main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Income</div>
          <div className="main-num text-2xl font-bold">{fmt(inc)}</div>
          <div className="mt-1 text-xs opacity-70">This month</div>
        </div>
        <div className="stat-expense main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Expenses</div>
          <div className="main-num text-2xl font-bold">{fmt(exp)}</div>
          <div className="mt-1 text-xs opacity-70">This month</div>
        </div>
        <div className="stat-savings main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Total Savings</div>
          <div className="main-num text-2xl font-bold">{fmt(totalSavings())}</div>
          <div className="mt-1 text-xs opacity-70">Active goals</div>
        </div>
        <div className="stat-net main-card-lift rounded-2xl p-4 text-white">
          <div className="mb-1 text-xs font-medium opacity-80">Net Balance</div>
          <div className="main-num text-2xl font-bold">{fmt(net)}</div>
          <div className="mt-1 text-xs opacity-70">Income - Expenses</div>
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
                No transactions yet
              </div>
            ) : (
              recent.map((t) => {
                const cat = categories.find((c) => c.name === t.category);
                const icon = cat?.icon ?? (t.type === "income" ? "💰" : "💸");
                const ds = new Date(t.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                        t.type === "income" ? "bg-[#00C89612]" : "bg-[#FF6B6B12]"
                      }`}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.desc}</div>
                      <div className="text-xs text-[#64748B] dark:text-[#8892B0]">
                        {t.category} · {ds}
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
                    <button
                      type="button"
                      onClick={() => deleteTransaction(t.id)}
                      className="ml-1 text-xs text-gray-300 hover:text-[#FF6B6B] dark:text-gray-600"
                      aria-label="Delete"
                    >
                      ✕
                    </button>
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
            {budgets.slice(0, 4).map((b) => {
              const spent = expenseByCategory(b.category);
              const p = pct(spent, b.limit);
              const color =
                p >= 90 ? "#FF6B6B" : p >= 70 ? "#F59E0B" : "#00C896";
              return (
                <div key={b.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{b.category}</span>
                    <span
                      className={`main-num ${
                        p >= 90 ? "text-[#FF6B6B]" : "text-[#64748B] dark:text-[#8892B0]"
                      }`}
                    >
                      {fmt(spent)} / {fmt(b.limit)}
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
            {budgets.length === 0 && (
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
          <div className="space-y-3">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
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
            ))}
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
            {savings.map((g) => {
              const p = pct(g.current, g.target);
              return (
                <div key={g.id}>
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
                    <span className="main-num">{fmt(g.current)}</span>
                    <span className="main-num">{fmt(g.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
