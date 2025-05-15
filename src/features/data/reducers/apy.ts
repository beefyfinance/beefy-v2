import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import type { ApyContractState, ApyState } from './apy-types.ts';

export const initialApyState: ApyState = {
  rawApy: { byVaultId: {}, byBoostId: {} },
  totalApy: { byVaultId: {} },
  rawAvgApy: { byVaultId: {} },
  avgApy: { byVaultId: {} },
};

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialApyState,
  reducers: {
    setApyContractState: (sliceState, action: PayloadAction<ApyContractState>) => {
      sliceState.rawApy.byBoostId = action.payload.rawApyByBoostId;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchApyAction.fulfilled, (sliceState, action) => {
        for (const [vaultId, apy] of Object.entries(action.payload.data)) {
          sliceState.rawApy.byVaultId[vaultId] = apy;
        }
      })
      .addCase(recalculateTotalApyAction.fulfilled, (sliceState, action) => {
        sliceState.totalApy.byVaultId = action.payload.totals;
      })
      .addCase(fetchAvgApyAction.fulfilled, (sliceState, action) => {
        sliceState.rawAvgApy.byVaultId = action.payload.data;
      })
      .addCase(recalculateAvgApyAction.fulfilled, (sliceState, action) => {
        sliceState.avgApy.byVaultId = action.payload.data;
      });
  },
});

export const setApyContractState = apySlice.actions.setApyContractState;
