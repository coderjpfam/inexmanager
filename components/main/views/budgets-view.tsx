"use client";

import { useFinance } from "@/components/main/finance-provider";
import { useState } from "react";

export function BudgetsView() {
  const { budgets, categories, fmt, pct, expenseByCategory, addBudget, deleteBudget } =
    useFinance();
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("Monthly");

  const expenseCats = categories.filter((c) => c.type === "expense");

  function submit() {
    const l = parseFloat(limit);
    if (!l || !category) return;
    addBudget({ category, limit: l, period });
    setLimit("");
    setCategory(expenseCats[0]?.name ?? "");
    setOpen(false);
  }

  return (
    <div className="main-fade-up space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setCategory(expenseCats[0]?.name ?? "");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
        >
          <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Budget
        </button>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#64748B] dark:text-[#8892B0]">
            No budgets set yet. Add your first one!
          </div>
        ) : (
          budgets.map((b) => {
            const spent = expenseByCategory(b.category);
            const p = pct(spent, b.limit);
            const over = spent > b.limit;
            const near = !over && p >= 75;
            return (
              <div
                key={b.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{b.category}</span>
                    <span className="ml-2 rounded-full bg-[#64748B26] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                      {b.period}
                    </span>
                    {over && (
                      <span className="ml-2 rounded-full bg-[#FF6B6B26] px-2 py-0.5 text-[11px] font-semibold text-[#FF6B6B]">
                        Over Budget!
                      </span>
                    )}
                    {near && !over && (
                      <span className="ml-2 rounded-full bg-[#F59E0B26] px-2 py-0.5 text-[11px] font-semibold text-[#F59E0B]">
                        Near Limit
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBudget(b.id)}
                    className="rounded-[10px] border border-[#FF6B6B4D] px-2.5 py-1 text-[11px] font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B14]"
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-2 flex justify-between text-xs text-[#64748B] dark:text-[#8892B0]">
                  <span>
                    Spent:{" "}
                    <span className={`main-num font-semibold ${over ? "text-[#FF6B6B]" : "text-gray-700 dark:text-gray-200"}`}>
                      {fmt(spent)}
                    </span>
                  </span>
                  <span>
                    Limit:{" "}
                    <span className="main-num font-semibold text-gray-700 dark:text-gray-200">{fmt(b.limit)}</span>
                  </span>
                  <span className="main-num">{p}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#F0F4F8] dark:bg-[#0F1117]">
                  <div
                    className="main-progress-fill h-full rounded-full"
                    style={{
                      width: `${p}%`,
                      background: over ? "#FF6B6B" : near ? "#F59E0B" : "#00C896",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {open && (
        <div
          className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <h2 className="mb-5 text-base font-semibold">Add Budget</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#13161F]"
                >
                  {expenseCats.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Limit (₹)</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="5000"
                  className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#13161F]"
                >
                  <option value="Monthly">📅 Monthly</option>
                  <option value="Weekly">📆 Weekly</option>
                  <option value="Custom">✏️ Custom</option>
                </select>
              </div>
              <button
                type="button"
                onClick={submit}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C]"
              >
                Add Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
