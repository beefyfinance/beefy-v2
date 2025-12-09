import { createSlice } from '@reduxjs/toolkit';
import { fetchWeeklyRevenueStats } from '../actions/revenue.ts';

export type RevenueState = {
  previousWeek: {
    yieldUsd: BigNumber | null;
    revenueUsd: BigNumber | null;
    buybackUsd: BigNumber | null;
    buybackAmount: BigNumber | null;
  };
};

export const initialRevenueState: RevenueState = {
  previousWeek: {
    yieldUsd: null,
    revenueUsd: null,
    buybackUsd: null,
    buybackAmount: null,
  },
};

export const revenueSlice = createSlice({
  name: 'revenue',
  initialState: initialRevenueState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWeeklyRevenueStats.fulfilled, (state, action) => {
      state.previousWeek = action.payload.data;
    });
  },
});
