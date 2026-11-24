import { createSlice } from '@reduxjs/toolkit';
import { fetchWeeklyRevenueStats } from '../actions/revenue.ts';
import type { RevenueWeek } from '../utils/platform-stats.ts';

export type RevenueState = {
  /** closed weeks, oldest first */
  weeks: RevenueWeek[];
};

export const initialRevenueState: RevenueState = {
  weeks: [],
};

export const revenueSlice = createSlice({
  name: 'revenue',
  initialState: initialRevenueState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWeeklyRevenueStats.fulfilled, (state, action) => {
      state.weeks = action.payload.weeks;
    });
  },
});
