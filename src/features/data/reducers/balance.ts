import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction } from '../actions/balance';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { selectIsStandardVaultEarnTokenId, selectVaultByEarnTokenId } from '../selectors/vaults';
import { accountHasChanged, walletHasDisconnected } from './wallet';

/**
 * State containing user balances state
 */
export interface BalanceState {
  depositedVaultIds: {
    govVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
    standardVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
  };

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
      byGovVaultId: {
        [vaultId: VaultEntity['id']]: {
          balance: BigNumber;
          rewards: BigNumber;
        };
      };
    };
  };
}
export const initialBalanceState: BalanceState = {
  byChainId: {},
  depositedVaultIds: { govVaults: [], standardVaults: [] },
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState: initialBalanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(accountHasChanged, sliceState => {
      sliceState.byChainId = {};
      sliceState.depositedVaultIds = { govVaults: [], standardVaults: [] };
    });
    builder.addCase(walletHasDisconnected, sliceState => {
      sliceState.byChainId = {};
      sliceState.depositedVaultIds = { govVaults: [], standardVaults: [] };
    });

    builder.addCase(fetchAllBalanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      for (const tokenBalance of action.payload.data.tokens) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForToken = sliceState.byChainId[chainId].byTokenId[tokenBalance.tokenId];
        if (
          // only if balance is non-zero
          !tokenBalance.amount.isZero() &&
          // and state isn't already there
          // if it's there, only if amount differ
          (stateForToken === undefined || !stateForToken.balance.isEqualTo(tokenBalance.amount))
        ) {
          sliceState.byChainId[chainId].byTokenId[tokenBalance.tokenId] = {
            balance: tokenBalance.amount,
          };

          // now, if this is a vault token, we want to mark this vault as deposited
          if (
            selectIsStandardVaultEarnTokenId(action.payload.state, chainId, tokenBalance.tokenId)
          ) {
            const vaultId = selectVaultByEarnTokenId(
              action.payload.state,
              chainId,
              tokenBalance.tokenId
            );
            sliceState.depositedVaultIds.standardVaults.push({ chainId, vaultId });
          }
        }
      }

      for (const boostBalance of action.payload.data.boosts) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForBoost = sliceState.byChainId[chainId].byBoostId[boostBalance.boostId];
        if (stateForBoost !== undefined && stateForBoost.balance === undefined) {
          debugger;
        }
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

      for (const vaultBalance of action.payload.data.govVaults) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForVault = sliceState.byChainId[chainId].byGovVaultId[vaultBalance.vaultId];
        if (
          // only if balance is non-zero
          !vaultBalance.rewards.isZero() &&
          // and state isn't already there
          // if it's there, only if amount differ
          (stateForVault === undefined || !stateForVault.rewards.isEqualTo(vaultBalance.rewards))
        ) {
          const vaultState = {
            rewards: vaultBalance.rewards,
            balance: vaultBalance.balance,
          };
          sliceState.byChainId[chainId].byGovVaultId[vaultBalance.vaultId] = vaultState;
          sliceState.depositedVaultIds.govVaults.push({
            chainId,
            vaultId: vaultBalance.vaultId,
          });
        }
      }
    });
  },
});
