"use client";

import { useFinance } from "@/components/main/finance-provider";
import { useState } from "react";

export function SavingsView() {
  const { savings, fmt, pct, addSaving, toggleSavingStatus, deleteSaving } = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [date, setDate] = useState("");

  function submit() {
    const n = name.trim();
    const t = parseFloat(target);
    const c = parseFloat(current) || 0;
    if (!n || !t) return;
    addSaving({
      name: n,
      target: t,
      current: c,
      date: date || new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setName("");
    setTarget("");
    setCurrent("");
    setOpen(false);
  }

  return (
    <div className="main-fade-up space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setDate(new Date().toISOString().split("T")[0]);
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
        >
          <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savings.map((g) => {
          const p = pct(g.current, g.target);
          const statusColor =
            g.status === "Completed" ? "green" : g.status === "Paused" ? "gray" : "blue";
          return (
            <div
              key={g.id}
              className="main-card-lift rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{g.name}</div>
                  <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#8892B0]">Target: {g.date}</div>
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
                  style={{ width: `${p}%` }}
                />
              </div>
              <div className="mb-3 flex justify-between text-xs text-[#64748B] dark:text-[#8892B0]">
                <span className="main-num">{fmt(g.current)}</span>
                <span className="main-num font-semibold text-[#6C63FF]">{p}%</span>
                <span className="main-num">{fmt(g.target)}</span>
              </div>
              <div className="flex gap-2">
                {g.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() => toggleSavingStatus(g.id)}
                    className="flex-1 rounded-[10px] border border-[#E2E8F0] bg-transparent py-2 text-xs font-semibold text-[#1E293B] hover:border-[#00C896] dark:border-[#2D3149] dark:text-[#E2E8F0]"
                  >
                    {g.status === "Active" ? "Pause" : "Resume"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteSaving(g.id)}
                  className="rounded-[10px] border border-[#FF6B6B4D] px-3 py-2 text-xs font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B14]"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Saved So Far</label>
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
                onClick={submit}
                className="w-full rounded-[10px] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C]"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
