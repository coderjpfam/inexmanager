import type { TransactionApiRow } from "@/lib/transactions/serialize";

export type { TransactionApiRow };

export type UiTransaction = {
  id: string;
  desc: string;
  category: string;
  account: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  categoryIcon?: string;
};

export type CategoryOption = {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
};

export type AccountOption = {
  _id: string;
  name: string;
  type: string;
  balance: number;
};

export type TransactionsQuery = {
  page: number;
  limit: number;
  sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
  search: string;
  type?: "income" | "expense";
};

export type TransactionsListPayload = {
  data: TransactionApiRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
  query: TransactionsQuery;
};

export type TransactionsSliceState = {
  items: UiTransaction[];
  pagination: TransactionsListPayload["pagination"] | null;
  summary: TransactionsListPayload["summary"] | null;
  query: TransactionsQuery;
  categories: CategoryOption[];
  accounts: AccountOption[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
