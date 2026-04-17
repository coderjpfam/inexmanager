import { createSlice } from "@reduxjs/toolkit";
import { fetchAnalyticsBundle } from "./analytics.thunk";
import type { AnalyticsSliceState } from "./analytics.types";

const initialState: AnalyticsSliceState = {
  bundle: null,
  status: "idle",
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics(state) {
      state.bundle = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsBundle.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAnalyticsBundle.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bundle = action.payload;
      })
      .addCase(fetchAnalyticsBundle.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
