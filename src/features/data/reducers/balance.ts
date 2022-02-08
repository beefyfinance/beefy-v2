import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction } from '../actions/balance';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import {
  selectIsStandardVaultEarnTokenId,
  selectVaultByEarnTokenId,
  selectVaultById,
} from '../selectors/vaults';

/**
 * State containing user balances state
 */
export interface BalanceState {
  // we want to keep everything by address to be able to display the right
  // data even when the user quickly changes account
  byAddress: {
    [address: string]: {
      // quick access to all deposited vaults for this address
      // this can include gov, standard, or a boost's target vault
      depositedVaultIds: VaultEntity['id'][];

      /**
       * all balances below represent token amounts
       * later we will want to have usd amount in another part of
       * the state (to avoid re-renders when prices change)
       */
      tokenAmount: {
        /**
         * Token balance, used to know standard vault balance with earnToken (mooXyzToken)
         * and oracle balance, to display how much the user can put in a vault or boost
         */
        byChainId: {
          [chainId: ChainEntity['id']]: {
            byTokenId: {
              [tokenId: TokenEntity['id']]: {
                balance: BigNumber;
              };
            };
          };
        };

        /**
         * The boost balance to know how much we withdraw from the boost
         * and how much rewards we can claim
         */
        byBoostId: {
          [boostId: BoostEntity['id']]: {
            balance: BigNumber;
            rewards: BigNumber;
          };
        };

        /**
         * The gov vault token balance and pending rewards
         */
        byGovVaultId: {
          [vaultId: VaultEntity['id']]: {
            balance: BigNumber;
            rewards: BigNumber;
          };
        };
      };
    };
  };
}
export const initialBalanceState: BalanceState = {
  byAddress: {},
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState: initialBalanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllBalanceAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const chainId = action.payload.chainId;
      const walletAddress = action.payload.walletAddress.toLocaleLowerCase();

      if (sliceState.byAddress[walletAddress] === undefined) {
        sliceState.byAddress[walletAddress] = {
          depositedVaultIds: [],
          tokenAmount: {
            byChainId: {},
            byBoostId: {},
            byGovVaultId: {},
          },
        };
      }

      const walletState = sliceState.byAddress[walletAddress];
      /**
       * Ingest token data
       */
      for (const tokenBalance of action.payload.data.tokens) {
        if (walletState.tokenAmount.byChainId[chainId] === undefined) {
          walletState.tokenAmount.byChainId[chainId] = { byTokenId: {} };
        }

        // only update data if necessary
        const stateForToken =
          walletState.tokenAmount.byChainId[chainId].byTokenId[tokenBalance.tokenId];
        if (
          // only if balance is non-zero
          !tokenBalance.amount.isZero() &&
          // and state isn't already there
          // if it's there, only if amount differ
          (stateForToken === undefined || !stateForToken.balance.isEqualTo(tokenBalance.amount))
        ) {
          walletState.tokenAmount.byChainId[chainId].byTokenId[tokenBalance.tokenId] = {
            balance: tokenBalance.amount,
          };

          // if the token is the earnedToken of a vault
          // this means the user deposited in this vault
          if (selectIsStandardVaultEarnTokenId(state, chainId, tokenBalance.tokenId)) {
            const vaultId = selectVaultByEarnTokenId(state, chainId, tokenBalance.tokenId);
            if (!walletState.depositedVaultIds.includes(vaultId)) {
              walletState.depositedVaultIds.push(vaultId);
            }
          }
        }
      }

      /**
       * Ingest boost data
       */
      for (const boostBalance of action.payload.data.boosts) {
        // only update data if necessary
        const stateForBoost = walletState.tokenAmount.byBoostId[boostBalance.boostId];
        if (
          stateForBoost === undefined ||
          !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
          !stateForBoost.rewards.isEqualTo(boostBalance.rewards)
        ) {
          walletState.tokenAmount.byBoostId[boostBalance.boostId] = {
            balance: boostBalance.balance,
            rewards: boostBalance.rewards,
          };

          const boost = selectBoostById(state, boostBalance.boostId);
          const boostedVault = selectVaultById(state, boost.vaultId);
          if (!walletState.depositedVaultIds.includes(boostedVault.id)) {
            walletState.depositedVaultIds.push(boostedVault.id);
          }
        }
      }

      /**
       * Ingest gov vaults data
       */
      for (const vaultBalance of action.payload.data.govVaults) {
        const vaultId = vaultBalance.vaultId;

        // only update data if necessary
        const stateForVault = walletState.tokenAmount.byGovVaultId[vaultId];
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
          walletState.tokenAmount.byGovVaultId[vaultId] = vaultState;

          if (!walletState.depositedVaultIds.includes(vaultId)) {
            walletState.depositedVaultIds.push(vaultId);
          }
        }
      }
    });
  },
});
