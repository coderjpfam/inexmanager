"use client";

import { useFinance, type TxType } from "@/components/main/finance-provider";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddTransactionModal({ open, onClose }: Props) {
  const {
    categories,
    accounts,
    addTransaction,
    accountIcon,
  } = useFinance();
  const [txType, setTxType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split("T")[0]);
      setAccount(accounts[0]?.name ?? "");
    }
  }, [open, accounts]);

  useEffect(() => {
    const cats = categories.filter((c) => c.type === txType);
    setCategory(cats[0]?.name ?? "");
  }, [txType, categories]);

  const catOptions = categories.filter((c) => c.type === txType);

  if (!open) return null;

  function submit() {
    const n = parseFloat(amount);
    if (!n || !desc.trim()) return;
    if (!category || !account) return;
    addTransaction({
      type: txType,
      amount: n,
      desc: desc.trim(),
      category,
      account,
      date,
    });
    setAmount("");
    setDesc("");
    onClose();
  }

  return (
    <div
      className="main-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tx-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-tx-title" className="text-base font-semibold">
            Add Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border-0 bg-transparent text-[#94A3B8] hover:bg-black/[0.06] hover:text-[#1E293B] dark:hover:bg-white/[0.07] dark:hover:text-[#E2E8F0]"
            aria-label="Close"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2 rounded-xl bg-[#F0F4F8] p-1 dark:bg-[#0F1117]">
            <button
              type="button"
              onClick={() => setTxType("income")}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                txType === "income"
                  ? "bg-[#00C896] text-white"
                  : "bg-transparent text-[#94A3B8]"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setTxType("expense")}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                txType === "expense"
                  ? "bg-[#FF6B6B] text-white"
                  : "bg-transparent text-[#94A3B8]"
              }`}
            >
              Expense
            </button>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="main-num w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm text-gray-900 focus:border-[#00C896] focus:outline-none focus:ring-[3px] focus:ring-[#00C896]/15 dark:border-[#2D3149] dark:bg-[#0F1117] dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
              Description
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What was this for?"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm focus:border-[#00C896] focus:outline-none focus:ring-[3px] focus:ring-[#00C896]/15 dark:border-[#2D3149] dark:bg-[#0F1117] dark:text-gray-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm focus:border-[#00C896] focus:outline-none dark:border-[#2D3149] dark:bg-[#13161F] dark:text-gray-100"
              >
                {catOptions.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
                Account
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm focus:border-[#00C896] focus:outline-none dark:border-[#2D3149] dark:bg-[#13161F] dark:text-gray-100"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name}>
                    {accountIcon(a.type)} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B] dark:text-[#8892B0]">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F0F4F8] px-4 py-2.5 text-sm focus:border-[#00C896] focus:outline-none dark:border-[#2D3149] dark:bg-[#0F1117] dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            className="w-full rounded-[10px] border border-[#00C896] bg-[#00C896] py-2.5 text-sm font-semibold text-white hover:bg-[#00A87C]"
          >
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
