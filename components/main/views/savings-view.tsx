"use client";

import { fmt } from "@/lib/finance/format";
import {
  contributeSaving,
  createSaving,
  deleteSaving,
  fetchSavings,
  updateSaving,
} from "@/store/savings/savings.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";

type StatusFilter = "all" | "Active" | "Paused" | "Completed";

export function SavingsView() {
  const dispatch = useAppDispatch();
  const { items: savings, totalSaved, status, error } = useAppSelector((s) => s.savings);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [contribOpen, setContribOpen] = useState(false);
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contribDate, setContribDate] = useState("");
  const [contribNote, setContribNote] = useState("");

  useEffect(() => {
    if (filter === "all") {
      void dispatch(fetchSavings({}));
    } else {
      void dispatch(fetchSavings({ status: filter }));
    }
  }, [dispatch, filter]);

  function openNewGoal() {
    setDate(new Date().toISOString().split("T")[0] ?? "");
    setOpen(true);
  }

  async function submit() {
    const n = name.trim();
    const t = parseFloat(target);
    const c = parseFloat(current) || 0;
    if (!n || !t) return;
    setSubmitting(true);
    try {
      await dispatch(
        createSaving({
          name: n,
          targetAmount: t,
          savedAmount: c,
          targetDate: date || undefined,
          ...(icon.trim() ? { icon: icon.trim() } : {}),
        }),
      ).unwrap();
      setName("");
      setTarget("");
      setCurrent("");
      setIcon("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function openContribute(goalId: string) {
    setContribGoalId(goalId);
    setContribDate(new Date().toISOString().split("T")[0] ?? "");
    setContribAmount("");
    setContribNote("");
    setContribOpen(true);
  }

  async function submitContribute() {
    if (!contribGoalId) return;
    const a = parseFloat(contribAmount);
    if (!a || !contribDate) return;
    setSubmitting(true);
    try {
      await dispatch(
        contributeSaving({
          id: contribGoalId,
          amount: a,
          date: contribDate,
          ...(contribNote.trim() ? { note: contribNote.trim() } : {}),
        }),
      ).unwrap();
      setContribOpen(false);
      setContribGoalId(null);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = status === "loading" && savings.length === 0;

  return (
    <div className="main-fade-up space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-[#64748B] dark:text-[#8892B0]" htmlFor="saving-filter">
            Status
          </label>
          <select
            id="saving-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm dark:border-[#2D3149] dark:bg-[#13161F]"
          >
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
          <span className="text-xs text-[#64748B] dark:text-[#8892B0]">
            Total saved: <span className="main-num font-semibold text-[#1E293B] dark:text-[#E2E8F0]">{fmt(totalSaved)}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => openNewGoal()}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
        >
          <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {error && status === "failed" && (
        <p className="rounded-xl border border-[#FF6B6B4D] bg-[#FF6B6B14] px-4 py-2 text-sm text-[#FF6B6B]">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading goals…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savings.map((g) => {
            const p = g.percentageComplete;
            const statusColor =
              g.status === "Completed" ? "green" : g.status === "Paused" ? "gray" : "blue";
            return (
              <div
                key={g._id}
                className="main-card-lift rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {g.icon ? `${g.icon} ` : ""}
                      {g.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#8892B0]">
                      {g.targetDate ? `Target: ${g.targetDate}` : "No target date"}
                      {g.daysRemaining > 0 && g.targetDate ? ` · ${g.daysRemaining}d left` : ""}
                    </div>
                    {g.requiredPerDay > 0 && g.status === "Active" && (
                      <div className="mt-1 text-[11px] text-[#64748B]">
                        ~{fmt(g.requiredPerDay)}/day needed
                      </div>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      statusColor === "green"
                        ? "bg-[#00C89626] text-[#00C896]"
                        : statusColor === "gray"
                          ? "bg-[#64748B26] text-[#64748B]"
                          : "bg-[#3B82F626] text-[#3B82F6]"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#F0F4F8] dark:bg-[#0F1117]">
                  <div
                    className="main-progress-fill h-full rounded-full bg-[#6C63FF]"
                    style={{ width: `${Math.min(100, p)}%` }}
                  />
                </div>
                <div className="mb-3 flex justify-between text-xs text-[#64748B] dark:text-[#8892B0]">
                  <span className="main-num">{fmt(g.savedAmount)}</span>
                  <span className="main-num font-semibold text-[#6C63FF]">{p}%</span>
                  <span className="main-num">{fmt(g.targetAmount)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={() => openContribute(g._id)}
                      className="flex-1 rounded-[10px] border border-[#00C8964D] bg-[#00C89614] py-2 text-xs font-semibold text-[#00A87C] hover:bg-[#00C89626]"
                    >
                      Add money
                    </button>
                  )}
                  {g.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        void dispatch(
                          updateSaving({
                            id: g._id,
                            status: g.status === "Active" ? "Paused" : "Active",
                          }),
                        )
                      }
                      className="flex-1 rounded-[10px] border border-[#E2E8F0] bg-transparent py-2 text-xs font-semibold text-[#1E293B] hover:border-[#00C896] dark:border-[#2D3149] dark:text-[#E2E8F0]"
                    >
                      {g.status === "Active" ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void dispatch(deleteSaving(g._id))}
                    className="rounded-[10px] border border-[#FF6B6B4D] px-3 py-2 text-xs font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B14]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && savings.length === 0 && !error && (
        <div className="py-8 text-center text-sm text-[#64748B]">No saving goals yet.</div>
      )}

      {open && (
        <div
          className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <h2 className="mb-5 text-base font-semibold">New Saving Goal</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Goal Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emergency Fund"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Icon (optional)</label>
                <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🛡️"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Target (₹)</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="50000"
                    className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Saved so far</label>
                  <input
                    type="number"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="0"
                    className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Target Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Create Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {contribOpen && contribGoalId && (
        <div
          className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setContribOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <h2 className="mb-5 text-base font-semibold">Add contribution</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Amount (₹)</label>
                <input
                  type="number"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Date</label>
                <input
                  type="date"
                  value={contribDate}
                  onChange={(e) => setContribDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Note (optional)</label>
                <input
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitContribute()}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Add contribution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
