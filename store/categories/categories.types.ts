export type CategoryListItem = {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color?: string;
  isDefault: boolean;
  transactionCount: number;
  totalAmount: number;
  createdAt: string;
};

/** Dropdown / transaction forms — minimal fields. */
export type CategoryOption = Pick<CategoryListItem, "_id" | "name" | "type" | "icon">;

export type CategoriesQuery = {
  type?: "income" | "expense";
};

export type CategoriesSliceState = {
  items: CategoryListItem[];
  count: number;
  query: CategoriesQuery;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
