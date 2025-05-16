import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { TvlState } from './tvl-types.ts';

export const initialTvlState: TvlState = {
  totalTvl: BIG_ZERO,
  byVaultId: {},
  byBoostId: {},
  byChaindId: {},
};

export const tvlSlice = createSlice({
  name: 'tvl',
  initialState: initialTvlState,
  reducers: {
    setTvlContractState: (sliceState, action: PayloadAction<TvlState>) => {
      sliceState.byVaultId = action.payload.byVaultId;
      sliceState.byBoostId = action.payload.byBoostId;
      sliceState.byChaindId = action.payload.byChaindId;
      sliceState.totalTvl = action.payload.totalTvl;
    },
  },
});

export const setTvlContractState = tvlSlice.actions.setTvlContractState;
