export type AccountLeanForApi = {
  _id: unknown;
  name: string;
  type: "Bank" | "Cash" | "Stocks" | "Crypto";
  balance?: number;
  currency?: string;
  institution?: string;
  accountNumber?: string;
  isArchived: boolean;
  createdAt: Date | string;
};

export function accountToListItem(a: AccountLeanForApi) {
  return {
    _id: String(a._id),
    name: a.name,
    type: a.type,
    balance: a.balance ?? 0,
    currency: a.currency ?? "INR",
    institution: a.institution,
    accountNumber: a.accountNumber,
    isArchived: a.isArchived,
    createdAt: new Date(a.createdAt).toISOString(),
  };
}

export function accountCreatedBody(a: AccountLeanForApi) {
  return {
    _id: String(a._id),
    name: a.name,
    type: a.type,
    balance: a.balance ?? 0,
    currency: a.currency ?? "INR",
    createdAt: new Date(a.createdAt).toISOString(),
  };
}
