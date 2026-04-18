import { createSlice } from "@reduxjs/toolkit";
import { deleteSaving, fetchSavings } from "./savings.thunk";
import type { SavingsSliceState } from "./savings.types";

const initialState: SavingsSliceState = {
  items: [],
  count: 0,
  totalSaved: 0,
  query: {},
  status: "idle",
  error: null,
};

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    clearSavings(state) {
      state.items = [];
      state.count = 0;
      state.totalSaved = 0;
      state.query = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSavings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.count = action.payload.count;
        state.totalSaved = action.payload.totalSaved;
        state.query = action.payload.query;
      })
      .addCase(fetchSavings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(deleteSaving.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearSavings } = savingsSlice.actions;
export default savingsSlice.reducer;
