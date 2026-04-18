export type SavingListItem = {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  percentageComplete: number;
  remainingAmount: number;
  targetDate?: string;
  daysRemaining: number;
  requiredPerDay: number;
  status: "Active" | "Paused" | "Completed";
  icon?: string;
  createdAt?: string;
};

export type SavingsQuery = {
  status?: "Active" | "Paused" | "Completed";
};

export type SavingsSliceState = {
  items: SavingListItem[];
  count: number;
  totalSaved: number;
  query: SavingsQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
