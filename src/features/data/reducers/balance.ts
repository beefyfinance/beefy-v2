import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchTokenBalanceAction } from '../actions/token-balance';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

/**
 * State containing user balances state
 */
export interface BalanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: BigNumber;
      };
    };
  };
}
export const initialBalanceState: BalanceState = { byChainId: {} };

export const balanceSlice = createSlice({
  name: 'balance',
  initialState: initialBalanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchTokenBalanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      for (const tokenBalance of action.payload.data) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {} };
        }

        sliceState.byChainId[chainId].byTokenId[tokenBalance.tokenId] = tokenBalance.amount;
      }
    });
  },
});
