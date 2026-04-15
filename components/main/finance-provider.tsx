"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCOUNT_ICONS } from "@/lib/finance/constants";
import { fmt, pct } from "@/lib/finance/format";
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_LENDING,
  INITIAL_SAVINGS,
  INITIAL_TRANSACTIONS,
} from "@/lib/finance/initial-state";
import type {
  Account,
  Budget,
  Category,
  LendingRecord,
  SavingGoal,
  Transaction,
  TxType,
} from "@/lib/finance/types";

type FinanceContextValue = {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  savings: SavingGoal[];
  lending: LendingRecord[];
  categories: Category[];
  fmt: typeof fmt;
  pct: typeof pct;
  totalIncome: () => number;
  totalExpense: () => number;
  totalSavings: () => number;
  expenseByCategory: (cat: string) => number;
  accountIcon: (type: string) => string;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: number) => void;
  addAccount: (a: Omit<Account, "id">) => void;
  deleteAccount: (id: number) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  deleteBudget: (id: number) => void;
  addSaving: (s: Omit<SavingGoal, "id" | "status"> & { status?: SavingGoal["status"] }) => void;
  toggleSavingStatus: (id: number) => void;
  deleteSaving: (id: number) => void;
  addLending: (
    r: Omit<LendingRecord, "id" | "paid" | "status"> & {
      paid?: number;
      status?: LendingRecord["status"];
    },
  ) => void;
  settleDebt: (id: number) => void;
  addPartialPayment: (id: number, amount: number) => void;
  deleteLending: (id: number) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  deleteCategory: (id: number) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    INITIAL_TRANSACTIONS,
  );
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savings, setSavings] = useState<SavingGoal[]>(INITIAL_SAVINGS);
  const [lending, setLending] = useState<LendingRecord[]>(INITIAL_LENDING);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const totalIncome = useCallback(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const totalExpense = useCallback(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const totalSavings = useCallback(
    () =>
      savings
        .filter((g) => g.status === "Active")
        .reduce((s, g) => s + g.current, 0),
    [savings],
  );

  const expenseByCategory = useCallback(
    (cat: string) =>
      transactions
        .filter((t) => t.type === "expense" && t.category === cat)
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const accountIcon = useCallback(
    (type: string) => ACCOUNT_ICONS[type] ?? "🏦",
    [],
  );

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...t, id: Date.now() }]);
  }, []);

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addAccount = useCallback((a: Omit<Account, "id">) => {
    setAccounts((prev) => [...prev, { ...a, id: Date.now() }]);
  }, []);

  const deleteAccount = useCallback((id: number) => {
    setAccounts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, "id">) => {
    setBudgets((prev) => {
      if (prev.some((x) => x.category === b.category)) return prev;
      return [...prev, { ...b, id: Date.now() }];
    });
  }, []);

  const deleteBudget = useCallback((id: number) => {
    setBudgets((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addSaving = useCallback(
    (
      s: Omit<SavingGoal, "id" | "status"> & {
        status?: SavingGoal["status"];
      },
    ) => {
      setSavings((prev) => [
        ...prev,
        {
          ...s,
          id: Date.now(),
          status: s.status ?? "Active",
        },
      ]);
    },
    [],
  );

  const toggleSavingStatus = useCallback((id: number) => {
    setSavings((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: g.status === "Active" ? "Paused" : "Active",
            }
          : g,
      ),
    );
  }, []);

  const deleteSaving = useCallback((id: number) => {
    setSavings((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addLending = useCallback(
    (
      r: Omit<LendingRecord, "id" | "paid" | "status"> & {
        paid?: number;
        status?: LendingRecord["status"];
      },
    ) => {
      setLending((prev) => [
        ...prev,
        {
          ...r,
          id: Date.now(),
          paid: r.paid ?? 0,
          status: r.status ?? "Active",
        },
      ]);
    },
    [],
  );

  const settleDebt = useCallback((id: number) => {
    setLending((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, paid: l.amount, status: "Settled" as const }
          : l,
      ),
    );
  }, []);

  const addPartialPayment = useCallback((id: number, amount: number) => {
    setLending((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextPaid = Math.min(l.paid + amount, l.amount);
        const settled = nextPaid >= l.amount;
        return {
          ...l,
          paid: nextPaid,
          status: settled ? ("Settled" as const) : l.status,
        };
      }),
    );
  }, []);

  const deleteLending = useCallback((id: number) => {
    setLending((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setCategories((prev) => [...prev, { ...c, id: Date.now() }]);
  }, []);

  const deleteCategory = useCallback((id: number) => {
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      accounts,
      budgets,
      savings,
      lending,
      categories,
      fmt,
      pct,
      totalIncome,
      totalExpense,
      totalSavings,
      expenseByCategory,
      accountIcon,
      addTransaction,
      deleteTransaction,
      addAccount,
      deleteAccount,
      addBudget,
      deleteBudget,
      addSaving,
      toggleSavingStatus,
      deleteSaving,
      addLending,
      settleDebt,
      addPartialPayment,
      deleteLending,
      addCategory,
      deleteCategory,
    }),
    [
      transactions,
      accounts,
      budgets,
      savings,
      lending,
      categories,
      totalIncome,
      totalExpense,
      totalSavings,
      expenseByCategory,
      accountIcon,
      addTransaction,
      deleteTransaction,
      addAccount,
      deleteAccount,
      addBudget,
      deleteBudget,
      addSaving,
      toggleSavingStatus,
      deleteSaving,
      addLending,
      settleDebt,
      addPartialPayment,
      deleteLending,
      addCategory,
      deleteCategory,
    ],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export type { TxType, Transaction } from "@/lib/finance/types";
