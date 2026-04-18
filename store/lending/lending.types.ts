export type LendingListItem = {
  _id: string;
  direction: "lend" | "borrow";
  personName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  percentagePaid: number;
  dueDate: string;
  isOverdue: boolean;
  note?: string;
  status: "Active" | "Settled" | "Overdue";
  createdAt?: string;
};

export type LendingSummary = {
  totalLent: number;
  totalLentRemaining: number;
  totalBorrowed: number;
  totalBorrowedRemaining: number;
  netPosition: number;
};

export type LendingQuery = {
  direction?: "lend" | "borrow";
  status?: "Active" | "Settled" | "Overdue";
};

export type LendingSliceState = {
  items: LendingListItem[];
  count: number;
  summary: LendingSummary;
  query: LendingQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
