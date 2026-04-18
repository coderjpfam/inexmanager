import { createSlice } from "@reduxjs/toolkit";
import { deleteBudget, fetchBudgets } from "./budgets.thunk";
import type { BudgetsSliceState } from "./budgets.types";

function defaultMonth(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const initialState: BudgetsSliceState = {
  items: [],
  query: { month: defaultMonth() },
  status: "idle",
  error: null,
};

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    clearBudgets(state) {
      state.items = [];
      state.query = { month: defaultMonth() };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.query = action.payload.query;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearBudgets } = budgetsSlice.actions;
export default budgetsSlice.reducer;
