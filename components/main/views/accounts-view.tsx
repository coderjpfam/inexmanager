"use client";

import { useFinance } from "@/components/main/finance-provider";
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from "@/lib/finance/constants";
import { useState } from "react";

export function AccountsView() {
  const { accounts, fmt, addAccount, deleteAccount } = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("Bank");

  function submit() {
    const n = name.trim();
    const b = parseFloat(balance) || 0;
    if (!n) return;
    addAccount({ name: n, type, balance: b });
    setName("");
    setBalance("");
    setType("Bank");
    setOpen(false);
  }

  return (
    <div className="main-fade-up space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
        >
          <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <div
            key={a.id}
            className="main-card-lift rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: `${ACCOUNT_COLORS[a.type] ?? "#64748B"}22` }}
              >
                {ACCOUNT_ICONS[a.type] ?? "🏦"}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  a.type === "Bank"
                    ? "bg-[#00C89626] text-[#00C896]"
                    : a.type === "Cash"
                      ? "bg-[#F59E0B26] text-[#F59E0B]"
                      : a.type === "Stocks"
                        ? "bg-[#6C63FF26] text-[#6C63FF]"
                        : "bg-[#FF6B6B26] text-[#FF6B6B]"
                }`}
              >
                {a.type}
              </span>
            </div>
            <div className="mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">{a.name}</div>
            <div className="main-num text-2xl font-bold">{fmt(a.balance)}</div>
            <button
              type="button"
              onClick={() => deleteAccount(a.id)}
              className="mt-3 rounded-[10px] border border-[#FF6B6B4D] bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B14]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div
          className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl dark:border-[#2D3149] dark:bg-[#1A1D27]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Add Account</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border-0 bg-transparent text-[#94A3B8] hover:bg-black/[0.06] dark:hover:bg-white/[0.07]"
                aria-label="Close"
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Account Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SBI Savings"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117] dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#13161F]"
                >
                  <option value="Bank">🏦 Bank</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Stocks">📈 Stocks</option>
                  <option value="Crypto">₿ Crypto</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Balance (₹)
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                onClick={submit}
                className="w-full rounded-[10px] border border-[#00C896] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C]"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
