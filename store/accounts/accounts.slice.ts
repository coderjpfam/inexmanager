import { createSlice } from "@reduxjs/toolkit";
import {
  archiveAccount,
  fetchAccounts,
  fetchAccountsSummary,
} from "./accounts.thunk";
import type { AccountsSliceState } from "./accounts.types";

const initialState: AccountsSliceState = {
  items: [],
  summary: null,
  status: "idle",
  error: null,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    clearAccounts(state) {
      state.items = [];
      state.summary = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(fetchAccountsSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(archiveAccount.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
