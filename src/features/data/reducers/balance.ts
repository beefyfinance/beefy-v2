import { createSlice } from '@reduxjs/toolkit';
import { Chain } from '../entities/chain';
import { Token } from '../entities/token';

/**
 * State containing user balances state
 */
export interface BalanceState {
  byChainId: {
    [chainId: Chain['id']]: {
      byTokenId: {
        [tokenId: Token['id']]: number; // big number?
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
