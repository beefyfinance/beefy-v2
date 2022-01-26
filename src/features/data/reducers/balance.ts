import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  fetchBoostBalanceAction,
  fetchGovVaultPoolsBalanceAction,
  fetchTokenBalanceAction,
} from '../actions/balance';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { accountHasChanged, walletHasDisconnected } from './wallet';

/**
 * State containing user balances state
 */
export interface BalanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: {
          balance: BigNumber;
        };
      };
      byBoostId: {
        [boostId: BoostEntity['id']]: {
          balance: BigNumber;
          rewards: BigNumber;
        };
      };
      byVaultId: {
        [vaultId: VaultEntity['id']]: {
          rewards: BigNumber;
        };
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
    builder.addCase(accountHasChanged, sliceState => {
      sliceState.byChainId = {};
    });
    builder.addCase(walletHasDisconnected, sliceState => {
      sliceState.byChainId = {};
    });

    builder.addCase(fetchTokenBalanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      for (const tokenBalance of action.payload.data) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byVaultId: {} };
        }

        // only update data if necessary
        const stateForToken = sliceState.byChainId[chainId].byTokenId[tokenBalance.tokenId];
        if (stateForToken === undefined || !stateForToken.balance.isEqualTo(tokenBalance.amount)) {
          sliceState.byChainId[chainId].byTokenId[tokenBalance.tokenId] = {
            balance: tokenBalance.amount,
          };
        }
      }
    });

    builder.addCase(fetchBoostBalanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      for (const boostBalance of action.payload.data) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byVaultId: {} };
        }

        // only update data if necessary
        const stateForBoost = sliceState.byChainId[chainId].byBoostId[boostBalance.boostId];
        if (
          stateForBoost === undefined ||
          !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
          !stateForBoost.rewards.isEqualTo(boostBalance.rewards)
        )
          sliceState.byChainId[chainId].byBoostId[boostBalance.boostId] = {
            balance: boostBalance.balance,
            rewards: boostBalance.rewards,
          };
      }
    });

    builder.addCase(fetchGovVaultPoolsBalanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      for (const vaultBalance of action.payload.data) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byVaultId: {} };
        }

        // only update data if necessary
        const stateForVault = sliceState.byChainId[chainId].byVaultId[vaultBalance.vaultId];
        if (stateForVault === undefined || !stateForVault.rewards.isEqualTo(vaultBalance.rewards)) {
          sliceState.byChainId[chainId].byVaultId[vaultBalance.vaultId] = {
            rewards: vaultBalance.rewards,
          };
        }
      }
    });
  },
});
