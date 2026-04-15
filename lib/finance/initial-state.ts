import type {
  Account,
  Budget,
  Category,
  LendingRecord,
  SavingGoal,
  Transaction,
} from "./types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: "income",
    amount: 85000,
    desc: "Monthly Salary",
    category: "Salary",
    account: "SBI Bank",
    date: "2026-04-01",
  },
  {
    id: 2,
    type: "expense",
    amount: 18000,
    desc: "House Rent",
    category: "Rent",
    account: "SBI Bank",
    date: "2026-04-02",
  },
  {
    id: 3,
    type: "expense",
    amount: 4200,
    desc: "Grocery Shopping",
    category: "Food",
    account: "Cash",
    date: "2026-04-03",
  },
  {
    id: 4,
    type: "expense",
    amount: 1500,
    desc: "Netflix & Spotify",
    category: "Entertainment",
    account: "SBI Bank",
    date: "2026-04-04",
  },
  {
    id: 5,
    type: "income",
    amount: 12000,
    desc: "Freelance Project",
    category: "Freelance",
    account: "SBI Bank",
    date: "2026-04-05",
  },
  {
    id: 6,
    type: "expense",
    amount: 800,
    desc: "Petrol",
    category: "Transport",
    account: "Cash",
    date: "2026-04-06",
  },
  {
    id: 7,
    type: "expense",
    amount: 3500,
    desc: "Electricity Bill",
    category: "Utilities",
    account: "SBI Bank",
    date: "2026-04-07",
  },
  {
    id: 8,
    type: "expense",
    amount: 2200,
    desc: "Restaurant Dinner",
    category: "Food",
    account: "Cash",
    date: "2026-04-08",
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, name: "SBI Bank", type: "Bank", balance: 125400 },
  { id: 2, name: "Cash Wallet", type: "Cash", balance: 8200 },
  { id: 3, name: "Zerodha", type: "Stocks", balance: 54000 },
  { id: 4, name: "WazirX", type: "Crypto", balance: 21500 },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 1, category: "Food", limit: 10000, period: "Monthly" },
  { id: 2, category: "Entertainment", limit: 3000, period: "Monthly" },
  { id: 3, category: "Transport", limit: 2000, period: "Monthly" },
  { id: 4, category: "Utilities", limit: 5000, period: "Monthly" },
];

export const INITIAL_SAVINGS: SavingGoal[] = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 200000,
    current: 85000,
    date: "2026-12-31",
    status: "Active",
  },
  {
    id: 2,
    name: "Vacation - Goa",
    target: 50000,
    current: 32000,
    date: "2026-06-01",
    status: "Active",
  },
  {
    id: 3,
    name: "New Laptop",
    target: 80000,
    current: 80000,
    date: "2026-01-01",
    status: "Completed",
  },
];

export const INITIAL_LENDING: LendingRecord[] = [
  {
    id: 1,
    type: "lend",
    name: "Rahul S",
    amount: 5000,
    paid: 2000,
    due: "2026-05-01",
    note: "Personal loan",
    status: "Active",
  },
  {
    id: 2,
    type: "borrow",
    name: "Priya M",
    amount: 3000,
    paid: 3000,
    due: "2026-03-01",
    note: "From sister",
    status: "Settled",
  },
  {
    id: 3,
    type: "lend",
    name: "Amit K",
    amount: 8000,
    paid: 0,
    due: "2026-06-15",
    note: "Business expense",
    status: "Active",
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Salary", type: "income", icon: "💼" },
  { id: 2, name: "Freelance", type: "income", icon: "💻" },
  { id: 3, name: "Investment", type: "income", icon: "📈" },
  { id: 4, name: "Other Income", type: "income", icon: "💰" },
  { id: 5, name: "Food", type: "expense", icon: "🍔" },
  { id: 6, name: "Rent", type: "expense", icon: "🏠" },
  { id: 7, name: "Transport", type: "expense", icon: "🚗" },
  { id: 8, name: "Entertainment", type: "expense", icon: "🎬" },
  { id: 9, name: "Utilities", type: "expense", icon: "⚡" },
  { id: 10, name: "Health", type: "expense", icon: "💊" },
  { id: 11, name: "Shopping", type: "expense", icon: "🛍️" },
];
