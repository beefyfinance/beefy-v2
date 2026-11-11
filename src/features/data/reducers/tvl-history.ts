import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import {
  fetchTvlHistoryMonth,
  fetchTvlHistoryYear,
  type TvlHistoryBucket,
} from '../actions/tvl-history.ts';
import type { TimePointWithMa } from '../utils/platform-stats.ts';

export type TvlHistoryState = {
  /** platform tvl (sum of chains while active), oldest first */
  byBucket: Partial<Record<TvlHistoryBucket, TimePointWithMa[]>>;
};

const initialTvlHistoryState: TvlHistoryState = {
  byBucket: {},
};

export const tvlHistorySlice = createSlice({
  name: 'tvlHistory',
  initialState: initialTvlHistoryState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(
      isAnyOf(fetchTvlHistoryMonth.fulfilled, fetchTvlHistoryYear.fulfilled),
      (state, action) => {
        state.byBucket[action.payload.bucket] = action.payload.points;
      }
    );
  },
});
