"use client";

import { fmt } from "@/lib/finance/format";
import {
  createLending,
  deleteLending,
  fetchLending,
  payLending,
  settleLending,
} from "@/store/lending/lending.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useMemo, useState } from "react";

type LendTab = "all" | "lend" | "borrow" | "settled";

export function LendingView() {
  const dispatch = useAppDispatch();
  const { items: allItems, summary, status, error } = useAppSelector((s) => s.lending);

  const [tab, setTab] = useState<LendTab>("all");
  const [open, setOpen] = useState(false);
  const [lendMode, setLendMode] = useState<"lend" | "borrow">("lend");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const [partial, setPartial] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void dispatch(fetchLending({}));
  }, [dispatch]);

  const { totalOut, totalIn, activeLent, activeBorr } = useMemo(() => {
    const lent = allItems.filter((l) => l.direction === "lend");
    const borr = allItems.filter((l) => l.direction === "borrow");
    const al = lent.filter((l) => l.status !== "Settled");
    const ab = borr.filter((l) => l.status !== "Settled");
    return {
      totalOut: summary.totalLentRemaining,
      totalIn: summary.totalBorrowedRemaining,
      activeLent: al,
      activeBorr: ab,
    };
  }, [allItems, summary]);

  const net = summary.netPosition;

  const items = useMemo(() => {
    let list = [...allItems];
    if (tab === "lend") list = list.filter((l) => l.direction === "lend" && l.status !== "Settled");
    else if (tab === "borrow") list = list.filter((l) => l.direction === "borrow" && l.status !== "Settled");
    else if (tab === "settled") list = list.filter((l) => l.status === "Settled");
    else list = list.filter((l) => l.status !== "Settled");
    return list;
  }, [allItems, tab]);

  function openModal(mode: "lend" | "borrow") {
    setLendMode(mode);
    setDue(new Date().toISOString().split("T")[0] ?? "");
    setOpen(true);
  }

  async function submitLend() {
    const n = name.trim();
    const a = parseFloat(amount);
    if (!n || !a) return;
    setSubmitting(true);
    try {
      await dispatch(
        createLending({
          direction: lendMode,
          personName: n,
          totalAmount: a,
          dueDate: due || new Date().toISOString().split("T")[0]!,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      ).unwrap();
      setName("");
      setAmount("");
      setNote("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = status === "loading" && allItems.length === 0;

  return (
    <div className="main-fade-up space-y-5">
      {error && status === "failed" && (
        <p className="rounded-xl border border-[#FF6B6B4D] bg-[#FF6B6B14] px-4 py-2 text-sm text-[#FF6B6B]">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Total Lent Out
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C89618]">
              <svg className="h-3.5 w-3.5 text-[#00C896]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <div className="main-num text-xl font-bold text-[#00C896]">{fmt(totalOut)}</div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-[#8892B0]">
            {activeLent.length} active record{activeLent.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Total Borrowed
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C63FF18]">
              <svg className="h-3.5 w-3.5 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <div className="main-num text-xl font-bold text-[#6C63FF]">{fmt(totalIn)}</div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-[#8892B0]">
            {activeBorr.length} active record{activeBorr.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
              Net Position
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B18]">
              <svg className="h-3.5 w-3.5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <div
            className={`main-num text-xl font-bold ${net >= 0 ? "text-[#00C896]" : "text-[#FF6B6B]"}`}
          >
            {fmt(Math.abs(net))}
          </div>
          <div className="mt-1 text-xs text-[#64748B] dark:text-[#8892B0]">Lent remaining minus borrowed remaining</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          {(
            [
              ["all", "All"],
              ["lend", "Lent"],
              ["borrow", "Borrowed"],
              ["settled", "Settled"],
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openModal("lend")}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Lend Money
          </button>
          <button
            type="button"
            onClick={() => openModal("borrow")}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#6C63FF] bg-[#6C63FF] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#5A52E8]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Borrow
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading records…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white py-12 text-center text-sm text-[#64748B] dark:border-[#2D3149] dark:bg-[#1A1D27] dark:text-[#8892B0]">
              No records in this category
            </div>
          ) : (
            items.map((l) => {
              const rem = l.remainingAmount;
              const p = l.percentagePaid;
              const isLend = l.direction === "lend";
              const isOverdueUi = l.isOverdue || l.status === "Overdue";
              const dueDate = new Date(l.dueDate + "T00:00:00.000Z").toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const initials = l.personName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const accentColor = isLend ? "#00C896" : "#6C63FF";
              const accentBg = isLend ? "#00C89618" : "#6C63FF18";

              return (
                <div
                  key={l._id}
                  className="main-card-lift overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white dark:border-[#2D3149] dark:bg-[#1A1D27]"
                >
                  <div className="h-1 w-full" style={{ background: accentColor }} />
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                          style={{ background: accentColor }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{l.personName}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isLend ? "bg-[#00C89626] text-[#00C896]" : "bg-[#6C63FF26] text-[#6C63FF]"
                              }`}
                            >
                              {isLend ? "↑ Lent" : "↓ Borrowed"}
                            </span>
                            {l.status === "Settled" ? (
                              <span className="rounded-full bg-[#64748B26] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                                Settled
                              </span>
                            ) : isOverdueUi ? (
                              <span className="rounded-full bg-[#FF6B6B26] px-2 py-0.5 text-[11px] font-semibold text-[#FF6B6B]">
                                Overdue
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#F59E0B26] px-2 py-0.5 text-[11px] font-semibold text-[#F59E0B]">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="main-num text-lg font-bold" style={{ color: accentColor }}>
                          {fmt(l.totalAmount)}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#64748B] dark:text-[#8892B0]">Total amount</div>
                      </div>
                    </div>

                    <div className="mb-4 rounded-xl p-3" style={{ background: accentBg }}>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-[#64748B] dark:text-[#8892B0]">Repaid</span>
                        <span className="main-num font-semibold" style={{ color: accentColor }}>
                          {p}%
                        </span>
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/50 dark:bg-black/20">
                        <div
                          className="main-progress-fill h-full rounded-full"
                          style={{ width: `${Math.min(100, p)}%`, background: accentColor }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="main-num font-medium" style={{ color: accentColor }}>
                          {fmt(l.paidAmount)} paid
                        </span>
                        <span className="main-num text-[#64748B] dark:text-[#8892B0]">{fmt(rem)} left</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between text-xs text-[#64748B] dark:text-[#8892B0]">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={isOverdueUi && l.status !== "Settled" ? "font-semibold text-[#FF6B6B]" : ""}>
                          Due {dueDate}
                        </span>
                      </div>
                      {l.note ? (
                        <span className="max-w-[140px] truncate italic">&quot;{l.note}&quot;</span>
                      ) : null}
                    </div>

                    {l.status !== "Settled" ? (
                      <>
                        <div className="mb-2 flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#64748B]">
                              ₹
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={rem}
                              placeholder="Amount paid"
                              value={partial[l._id] ?? ""}
                              onChange={(e) =>
                                setPartial((prev) => ({ ...prev, [l._id]: e.target.value }))
                              }
                              className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-7 pr-3 text-xs dark:border-[#2D3149] dark:bg-[#0F1117]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const v = parseFloat(partial[l._id] ?? "");
                              if (!v || v <= 0) return;
                              const today = new Date().toISOString().split("T")[0]!;
                              void dispatch(
                                payLending({
                                  id: l._id,
                                  amount: v,
                                  date: today,
                                }),
                              );
                              setPartial((prev) => ({ ...prev, [l._id]: "" }));
                            }}
                            className="rounded-[10px] border border-[#00C896] bg-[#00C896] px-3 py-2 text-xs font-semibold text-white"
                          >
                            + Pay
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void dispatch(settleLending({ id: l._id }))}
                            className="flex-1 rounded-[10px] border py-2 text-xs font-semibold"
                            style={{ borderColor: `${accentColor}40`, color: accentColor }}
                          >
                            Mark Settled
                          </button>
                          <button
                            type="button"
                            onClick={() => void dispatch(deleteLending(l._id))}
                            className="rounded-[10px] border border-[#FF6B6B4D] px-3 py-2 text-xs font-semibold text-[#FF6B6B]"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#00C89612] py-1.5 text-xs font-semibold text-[#00C896]">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Fully settled
                      </div>
                    )}
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
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <h2 className="mb-5 text-base font-semibold">
              {lendMode === "lend" ? "Add Lending Record" : "Add Borrowing Record"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Person Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Due Date</label>
                  <input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Note</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitLend()}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
