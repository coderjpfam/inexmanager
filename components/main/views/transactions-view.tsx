"use client";

import { useFinance } from "@/components/main/finance-provider";
import { useMemo, useState } from "react";

type Filter = "all" | "income" | "expense";
type Sort = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function TransactionsView() {
  const { transactions, categories, fmt, deleteTransaction } = useFinance();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("date-desc");

  const filtered = useMemo(() => {
    let txs = [...transactions];
    if (filter !== "all") txs = txs.filter((t) => t.type === filter);
    const q = search.toLowerCase();
    if (q) {
      txs = txs.filter(
        (t) =>
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q),
      );
    }
    txs.sort((a, b) => {
      if (sort === "date-desc")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "date-asc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc") return a.amount - b.amount;
      return 0;
    });
    return txs;
  }, [transactions, filter, search, sort]);

  const incomeSum = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenseSum = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const groups = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    filtered.forEach((t) => {
      if (!g[t.date]) g[t.date] = [];
      g[t.date].push(t);
    });
    const dates = Object.keys(g).sort((a, b) =>
      sort.includes("asc")
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime(),
    );
    return dates.map((d) => ({ date: d, txs: g[d]! }));
  }, [filtered, sort]);

  return (
    <div className="main-fade-up space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C89615]">
            <svg className="h-4 w-4 text-[#00C896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Income
            </div>
            <div className="main-num text-sm font-bold text-[#00C896]">{fmt(incomeSum)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B6B15]">
            <svg className="h-4 w-4 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Expenses
            </div>
            <div className="main-num text-sm font-bold text-[#FF6B6B]">{fmt(expenseSum)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C63FF15]">
            <svg className="h-4 w-4 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Count
            </div>
            <div className="main-num text-sm font-bold text-[#6C63FF]">{filtered.length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-[#8892B0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, category, account…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm dark:border-[#2D3149] dark:bg-[#1A1D27]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="min-w-[100px] rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs dark:border-[#2D3149] dark:bg-[#13161F]"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="min-w-[120px] rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs dark:border-[#2D3149] dark:bg-[#13161F]"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 dark:border-[#2D3149] dark:bg-[#13161F] sm:grid">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8892B0]">
            Description
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8892B0]">
            Category
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8892B0]">
            Account
          </div>
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8892B0]">
            Amount
          </div>
          <div className="w-6" />
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
            No transactions match your filters
          </div>
        ) : (
          groups.map(({ date, txs }) => {
            const d = new Date(date);
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            const label =
              date === today
                ? "Today"
                : date === yesterday
                  ? "Yesterday"
                  : d.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    });
            const dayInc = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const dayExp = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2 dark:border-[#2D3149] dark:bg-[#13161F]">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
                    {label}
                  </span>
                  <div className="main-num flex gap-3 text-[11px]">
                    {dayInc > 0 && (
                      <span className="font-semibold text-[#00C896]">+{fmt(dayInc)}</span>
                    )}
                    {dayExp > 0 && (
                      <span className="font-semibold text-[#FF6B6B]">−{fmt(dayExp)}</span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-[#E2E8F0] dark:divide-[#2D3149]">
                  {txs.map((t) => {
                    const cat = categories.find((c) => c.name === t.category);
                    const icon = cat?.icon ?? (t.type === "income" ? "💰" : "💸");
                    const dateStr = new Date(t.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <div key={t.id}>
                        <div className="group hidden grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#13161F] sm:grid">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                                t.type === "income" ? "bg-[#00C89612]" : "bg-[#FF6B6B12]"
                              }`}
                            >
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                                {t.desc}
                              </div>
                              <div className="text-xs text-[#64748B] dark:text-[#8892B0]">{dateStr}</div>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                t.type === "income"
                                  ? "bg-[#00C89626] text-[#00C896]"
                                  : "bg-[#FF6B6B26] text-[#FF6B6B]"
                              }`}
                            >
                              {t.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate text-xs text-[#64748B] dark:text-[#8892B0]">
                            <span>{t.account.includes("SBI") ? "🏦" : "💵"}</span>
                            <span className="truncate">{t.account}</span>
                          </div>
                          <div
                            className={`main-num text-right text-sm font-bold ${
                              t.type === "income" ? "text-[#00C896]" : "text-[#FF6B6B]"
                            }`}
                          >
                            {t.type === "income" ? "+" : "−"}
                            {fmt(t.amount)}
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(t.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#CBD5E1] opacity-0 transition-opacity hover:bg-[#FF6B6B12] hover:text-[#FF6B6B] group-hover:opacity-100"
                            aria-label="Delete"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#13161F] sm:hidden">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                              t.type === "income" ? "bg-[#00C89612]" : "bg-[#FF6B6B12]"
                            }`}
                          >
                            {icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium">{t.desc}</span>
                              <span
                                className={`main-num shrink-0 text-sm font-bold ${
                                  t.type === "income" ? "text-[#00C896]" : "text-[#FF6B6B]"
                                }`}
                              >
                                {t.type === "income" ? "+" : "−"}
                                {fmt(t.amount)}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  t.type === "income"
                                    ? "bg-[#00C89626] text-[#00C896]"
                                    : "bg-[#FF6B6B26] text-[#FF6B6B]"
                                }`}
                              >
                                {t.category}
                              </span>
                              <span className="text-[10px] text-[#64748B] dark:text-[#8892B0]">{dateStr}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(t.id)}
                            className="text-gray-300 hover:text-[#FF6B6B] dark:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
