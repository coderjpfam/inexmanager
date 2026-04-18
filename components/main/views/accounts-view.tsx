"use client";

import { fmt } from "@/lib/finance/format";
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from "@/lib/finance/constants";
import type { AccountType } from "@/store/accounts/accounts.types";
import {
  archiveAccount,
  createAccount,
  fetchAccounts,
  fetchAccountsSummary,
} from "@/store/accounts/accounts.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";

export function AccountsView() {
  const dispatch = useAppDispatch();
  const { items: accounts, summary, status, error } = useAppSelector((s) => s.accounts);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AccountType>("Bank");
  const [currency, setCurrency] = useState("INR");
  const [institution, setInstitution] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void dispatch(fetchAccounts());
    void dispatch(fetchAccountsSummary());
  }, [dispatch]);

  async function submit() {
    const n = name.trim();
    const b = parseFloat(balance) || 0;
    if (!n) return;
    setSubmitting(true);
    try {
      await dispatch(
        createAccount({
          name: n,
          type,
          balance: b,
          currency: currency.trim() || "INR",
          institution: institution.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
        }),
      ).unwrap();
      setName("");
      setBalance("");
      setType("Bank");
      setCurrency("INR");
      setInstitution("");
      setAccountNumber("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    await dispatch(archiveAccount(id)).unwrap();
  }

  const loading = status === "loading" && accounts.length === 0;

  return (
    <div className="main-fade-up space-y-5">
      {summary && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[#64748B] dark:text-[#8892B0]">
            Total across accounts
          </div>
          <div className="main-num text-2xl font-bold text-[#0F172A] dark:text-white">
            {fmt(summary.totalBalance)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["Bank", summary.byType.Bank],
                ["Cash", summary.byType.Cash],
                ["Stocks", summary.byType.Stocks],
                ["Crypto", summary.byType.Crypto],
              ] as const
            ).map(([label, val]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] dark:border-[#2D3149] dark:bg-[#13161F]"
              >
                <span className="font-medium text-[#64748B]">{label}</span>
                <span className="main-num font-semibold">{fmt(val)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

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

      {error && status === "failed" && (
        <p className="rounded-xl border border-[#FF6B6B4D] bg-[#FF6B6B14] px-4 py-2 text-sm text-[#FF6B6B]">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-[#64748B]">Loading accounts…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <div
              key={a._id}
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
              {a.institution ? (
                <div className="mb-1 text-[11px] text-[#94A3B8]">{a.institution}</div>
              ) : null}
              <div className="main-num text-2xl font-bold">{fmt(a.balance)}</div>
              <button
                type="button"
                onClick={() => void remove(a._id)}
                className="mt-3 rounded-[10px] border border-[#FF6B6B4D] bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[#FF6B6B] hover:bg-[#FF6B6B14]"
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && accounts.length === 0 && !error && (
        <p className="text-sm text-[#64748B]">No accounts yet. Add one to get started.</p>
      )}

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
                  onChange={(e) => setType(e.target.value as AccountType)}
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
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Currency
                </label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="INR"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Institution (optional)
                </label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                  Account number (optional)
                </label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="****4321"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm dark:border-[#2D3149] dark:bg-[#0F1117]"
                />
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submit()}
                className="w-full rounded-[10px] border border-[#00C896] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
