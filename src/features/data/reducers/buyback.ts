import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchBeefyBuybackAction } from '../actions/prices';
import { ChainEntity } from '../entities/chain';

/**
 * State containing APY infos indexed by vault id
 */
export interface BuybackState {
  byChainId: {
    [byChainId: ChainEntity['id']]: { buybackTokenAmount: BigNumber; buybackUsdAmount: BigNumber };
  };
}
export const initialBuybackState: BuybackState = {
  byChainId: {},
};

export const buybackSlice = createSlice({
  name: 'buyback',
  initialState: initialBuybackState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchBeefyBuybackAction.fulfilled, (sliceState, action) => {
      // states have compatible types for now
      sliceState.byChainId = action.payload;
    });
  },
});
