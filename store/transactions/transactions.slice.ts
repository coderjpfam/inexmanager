import { createSlice } from "@reduxjs/toolkit";
import {
  deleteTransaction,
  fetchAccounts,
  fetchCategories,
  fetchTransactions,
  mapRowsToUi,
} from "./transactions.thunk";
import type { TransactionsQuery, TransactionsSliceState } from "./transactions.types";

const defaultQuery: TransactionsQuery = {
  page: 1,
  limit: 50,
  sort: "date-desc",
  search: "",
};

const initialState: TransactionsSliceState = {
  items: [],
  pagination: null,
  summary: null,
  query: defaultQuery,
  categories: [],
  accounts: [],
  status: "idle",
  error: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions(state) {
      state.items = [];
      state.pagination = null;
      state.summary = null;
      state.query = defaultQuery;
      state.categories = [];
      state.accounts = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = mapRowsToUi(action.payload.data);
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
        state.query = action.payload.query;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Delete failed";
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
