export type TxType = "income" | "expense";

export type Transaction = {
  id: number;
  type: TxType;
  amount: number;
  desc: string;
  category: string;
  account: string;
  date: string;
};

export type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
};

export type Budget = {
  id: number;
  category: string;
  limit: number;
  period: string;
};

export type SavingGoal = {
  id: number;
  name: string;
  target: number;
  current: number;
  date: string;
  status: "Active" | "Completed" | "Paused";
};

export type LendingRecord = {
  id: number;
  type: "lend" | "borrow";
  name: string;
  amount: number;
  paid: number;
  due: string;
  note: string;
  status: "Active" | "Settled";
};

export type Category = {
  id: number;
  name: string;
  type: TxType;
  icon: string;
};
