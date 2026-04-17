import { configureStore } from "@reduxjs/toolkit";
import analyticsReducer from "./analytics/analytics.slice";
import authReducer from "./auth/auth.slice";
import dashboardReducer from "./dashboard/dashboard.slice";
import transactionsReducer from "./transactions/transactions.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
