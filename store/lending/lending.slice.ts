import { createSlice } from "@reduxjs/toolkit";
import { deleteLending, fetchLending } from "./lending.thunk";
import type { LendingSliceState } from "./lending.types";

const initialState: LendingSliceState = {
  items: [],
  count: 0,
  summary: {
    totalLent: 0,
    totalLentRemaining: 0,
    totalBorrowed: 0,
    totalBorrowedRemaining: 0,
    netPosition: 0,
  },
  query: {},
  status: "idle",
  error: null,
};

const lendingSlice = createSlice({
  name: "lending",
  initialState,
  reducers: {
    clearLending(state) {
      state.items = [];
      state.count = 0;
      state.summary = initialState.summary;
      state.query = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLending.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLending.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.count = action.payload.count;
        state.summary = action.payload.summary;
        state.query = action.payload.query;
      })
      .addCase(fetchLending.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(deleteLending.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearLending } = lendingSlice.actions;
export default lendingSlice.reducer;
