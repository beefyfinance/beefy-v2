import { createSlice } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

/**
 * State containing user balances state
 */
export interface BalanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: number; // big number?
      };
    };
  };
}
const initialState: BalanceState = { byChainId: {} };

export const balanceSlice = createSlice({
  name: 'balance',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // todo: handle actions
  },
});
