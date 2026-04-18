"use client";

import { fmt } from "@/lib/finance/format";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
} from "@/store/categories/categories.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useMemo, useState } from "react";

type CatTab = "all" | "income" | "expense";

export function CategoriesView() {
  const dispatch = useAppDispatch();
  const { items: categories, status, error } = useAppSelector((s) => s.categories);

  const [tab, setTab] = useState<CatTab>("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [color, setColor] = useState("");
  const [catType, setCatType] = useState<"income" | "expense">("income");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void dispatch(fetchCategories({}));
  }, [dispatch]);

  const { total, incomeN, expenseN } = useMemo(() => {
    const inc = categories.filter((c) => c.type === "income").length;
    const exp = categories.filter((c) => c.type === "expense").length;
    return { total: categories.length, incomeN: inc, expenseN: exp };
  }, [categories]);

  const visible = useMemo(() => {
    if (tab === "income") return categories.filter((c) => c.type === "income");
    if (tab === "expense") return categories.filter((c) => c.type === "expense");
    return categories;
  }, [categories, tab]);

  async function submit() {
    const n = name.trim();
    if (!n) return;
    setSubmitting(true);
    try {
      await dispatch(
        createCategory({
          name: n,
          type: catType,
          icon: icon || "📌",
          ...(color.trim() ? { color: color.trim() } : {}),
        }),
      ).unwrap();
      setName("");
      setIcon("📌");
      setColor("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = status === "loading" && categories.length === 0;

  return (
    <div className="main-fade-up space-y-5">
      {error && status === "failed" && (
        <p className="rounded-xl border border-[#FF6B6B4D] bg-[#FF6B6B14] px-4 py-2 text-sm text-[#FF6B6B]">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C63FF15]">
            <svg className="h-5 w-5 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Total Categories
            </div>
            <div className="text-2xl font-bold text-[#6C63FF]">{total}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C89615]">
            <svg className="h-5 w-5 text-[#00C896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">Income</div>
            <div className="text-2xl font-bold text-[#00C896]">{incomeN}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6B6B15]">
            <svg className="h-5 w-5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">Expense</div>
            <div className="text-2xl font-bold text-[#FF6B6B]">{expenseN}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          {(
            [
              ["all", "All"],
              ["income", "Income"],
              ["expense", "Expense"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === id
                  ? "bg-[#00C896] text-white"
                  : "text-[#64748B] hover:bg-[#00C89614] dark:text-[#8892B0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
        >
          <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading categories…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-16 dark:border-[#2D3149] dark:bg-[#1A1D27]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F4F8] text-3xl dark:bg-[#0F1117]">
                {tab === "income" ? "💰" : tab === "expense" ? "💸" : "🏷️"}
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {tab === "all" ? "No categories yet" : `No ${tab} categories yet`}
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#8892B0]">Click &quot;New Category&quot; to add one</p>
            </div>
          ) : (
            visible.map((c) => {
              const isIncome = c.type === "income";
              const accentColor = c.color ?? (isIncome ? "#00C896" : "#FF6B6B");
              const accentBg = isIncome ? "#00C89612" : "#FF6B6B12";

              return (
                <div
                  key={c._id}
                  className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#2D3149] dark:bg-[#1A1D27]"
                >
                  <div className="h-1 w-full" style={{ background: accentColor }} />
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: accentBg }}
                      >
                        {c.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isIncome ? "bg-[#00C89626] text-[#00C896]" : "bg-[#FF6B6B26] text-[#FF6B6B]"
                          }`}
                        >
                          {isIncome ? "Income" : "Expense"}
                        </span>
                        {c.isDefault ? (
                          <span className="rounded-full bg-[#64748B26] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
                            Default
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void dispatch(deleteCategory(c._id))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#CBD5E1] opacity-0 transition-opacity hover:bg-[#FF6B6B12] hover:text-[#FF6B6B] group-hover:opacity-100 dark:text-[#4B5563]"
                          aria-label="Delete category"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">{c.name}</div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-2.5" style={{ background: accentBg }}>
                        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
                          Total
                        </div>
                        <div className="main-num text-sm font-bold" style={{ color: accentColor }}>
                          {fmt(c.totalAmount)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-2.5 dark:bg-[#0F1117]">
                        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
                          Transactions
                        </div>
                        <div className="main-num text-sm font-bold text-gray-800 dark:text-gray-100">
                          {c.transactionCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {open && (
        <div
          className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <h2 className="mb-5 text-base font-semibold">Add Category</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Type</label>
                <div className="flex gap-2 rounded-xl bg-[#F0F4F8] p-1 dark:bg-[#0F1117]">
                  <button
                    type="button"
                    onClick={() => setCatType("income")}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${
                      catType === "income" ? "bg-[#00C896] text-white" : "text-[#94A3B8]"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType("expense")}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${
                      catType === "expense" ? "bg-[#FF6B6B] text-white" : "text-[#94A3B8]"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Icon (emoji)
                </label>
                <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                  placeholder="💰"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-center text-2xl dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Color (optional, hex)
                </label>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#10B981"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
