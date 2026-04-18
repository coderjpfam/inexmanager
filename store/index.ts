import { configureStore } from "@reduxjs/toolkit";
import accountsReducer from "./accounts/accounts.slice";
import budgetsReducer from "./budgets/budgets.slice";
import savingsReducer from "./savings/savings.slice";
import lendingReducer from "./lending/lending.slice";
import categoriesReducer from "./categories/categories.slice";
import analyticsReducer from "./analytics/analytics.slice";
import authReducer from "./auth/auth.slice";
import dashboardReducer from "./dashboard/dashboard.slice";
import transactionsReducer from "./transactions/transactions.slice";
import type { RootState } from "./root-state";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    accounts: accountsReducer,
    budgets: budgetsReducer,
    savings: savingsReducer,
    lending: lendingReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
  },
});

export type { RootState };
export type AppDispatch = typeof store.dispatch;
