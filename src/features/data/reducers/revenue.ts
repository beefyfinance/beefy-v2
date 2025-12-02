import { createSlice } from '@reduxjs/toolkit';
import { fetchWeeklyRevenueStats } from '../actions/revenue.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';

export type RevenueState = {
  currentWeek: {
    yieldUsd: BigNumber;
    revenueUsd: BigNumber;
    buybackUsd: BigNumber;
    buybackAmount: BigNumber;
  };
};

export const initialRevenueState: RevenueState = {
  currentWeek: {
    yieldUsd: BIG_ZERO,
    revenueUsd: BIG_ZERO,
    buybackUsd: BIG_ZERO,
    buybackAmount: BIG_ZERO,
  },
};

export const revenueSlice = createSlice({
  name: 'revenue',
  initialState: initialRevenueState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWeeklyRevenueStats.fulfilled, (state, action) => {
      state.currentWeek = action.payload.data;
    });
  },
});
