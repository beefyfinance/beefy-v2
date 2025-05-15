import { createSlice } from '@reduxjs/toolkit';
import { fetchTreasury } from '../actions/treasury.ts';
import type { TreasuryState } from './treasury-types.ts';

export const initialState: TreasuryState = {
  byChainId: {},
  byMarketMakerId: {},
};

export const treasurySlice = createSlice({
  name: 'treasury',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchTreasury.fulfilled, (sliceState, action) => {
      sliceState.byChainId = action.payload.addressHoldingByChainId;
      sliceState.byMarketMakerId = action.payload.exchangeHoldingByMarketMakerId;
    });
  },
});
