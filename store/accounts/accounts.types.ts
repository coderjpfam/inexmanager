export type AccountType = "Bank" | "Cash" | "Stocks" | "Crypto";

export type AccountListItem = {
  _id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution?: string;
  accountNumber?: string;
  isArchived: boolean;
  createdAt: string;
};

export type AccountsSummary = {
  totalBalance: number;
  byType: {
    Bank: number;
    Cash: number;
    Stocks: number;
    Crypto: number;
  };
};

export type AccountsSliceState = {
  items: AccountListItem[];
  summary: AccountsSummary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  institution?: string;
  accountNumber?: string;
};

export type UpdateAccountInput = {
  id: string;
  name?: string;
  balance?: number;
  institution?: string;
  accountNumber?: string;
  currency?: string;
  type?: AccountType;
};
