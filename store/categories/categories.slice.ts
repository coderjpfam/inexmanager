import { createSlice } from "@reduxjs/toolkit";
import { deleteCategory, fetchCategories } from "./categories.thunk";
import type { CategoriesSliceState } from "./categories.types";

const initialState: CategoriesSliceState = {
  items: [],
  count: 0,
  query: {},
  status: "idle",
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategories(state) {
      state.items = [];
      state.count = 0;
      state.query = {};
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.count = action.payload.count;
        state.query = action.payload.query;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? "Failed";
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
