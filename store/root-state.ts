import type { AccountsSliceState } from "./accounts/accounts.types";
import type { AnalyticsSliceState } from "./analytics/analytics.types";
import type { AuthSliceState } from "./auth/auth.slice";
import type { BudgetsSliceState } from "./budgets/budgets.types";
import type { DashboardSliceState } from "./dashboard/dashboard.types";
import type { SavingsSliceState } from "./savings/savings.types";
import type { LendingSliceState } from "./lending/lending.types";
import type { CategoriesSliceState } from "./categories/categories.types";
import type { TransactionsSliceState } from "./transactions/transactions.types";

/** Combined app state — keep in sync when adding reducers in `store/index.ts`. */
export type RootState = {
  auth: AuthSliceState;
  dashboard: DashboardSliceState;
  analytics: AnalyticsSliceState;
  accounts: AccountsSliceState;
  budgets: BudgetsSliceState;
  savings: SavingsSliceState;
  lending: LendingSliceState;
  categories: CategoriesSliceState;
  transactions: TransactionsSliceState;
};
