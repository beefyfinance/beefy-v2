import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllAllowanceAction } from '../actions/allowance';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { accountHasChanged, walletHasDisconnected } from './wallet';

/**
 * State containing user allowances state
 * Allowance being the amount allowed to be spent big a contract
 * for the currently connected user
 */
export interface AllowanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: {
          bySpenderAddress: {
            [spenderAddress: string]: BigNumber;
          };
        };
      };
    };
  };
}
export const initialAllowanceState: AllowanceState = { byChainId: {} };

export const allowanceSlice = createSlice({
  name: 'allowance',
  initialState: initialAllowanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // reset state on user disconnect or address change
    builder.addCase(accountHasChanged, sliceState => {
      sliceState.byChainId = {};
    });
    builder.addCase(walletHasDisconnected, sliceState => {
      sliceState.byChainId = {};
    });

    builder.addCase(fetchAllAllowanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      let stateForChain = sliceState.byChainId[chainId];
      if (stateForChain === undefined) {
        sliceState.byChainId[chainId] = { byTokenId: {} };
        stateForChain = sliceState.byChainId[chainId];
      }

      for (const tokenAllowance of action.payload.data) {
        let stateForToken = stateForChain.byTokenId[tokenAllowance.tokenId];
        if (stateForToken === undefined) {
          stateForChain.byTokenId[tokenAllowance.tokenId] = { bySpenderAddress: {} };
          stateForToken = stateForChain.byTokenId[tokenAllowance.tokenId];
        }

        // only update data if necessary
        let stateForSpender = stateForToken.bySpenderAddress[tokenAllowance.spenderAddress];
        if (stateForSpender === undefined || !stateForSpender.isEqualTo(tokenAllowance.allowance)) {
          stateForToken.bySpenderAddress[tokenAllowance.spenderAddress] = tokenAllowance.allowance;
        }
      }
    });
  },
});
