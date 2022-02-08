import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO, byDecimals } from '../../../helpers/format';
import { fetchAllBalanceAction } from '../actions/balance';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenById } from '../selectors/tokens';
import {
  selectIsStandardVaultEarnTokenId,
  selectVaultByEarnTokenId,
  selectVaultById,
  selectVaultPricePerFullShare,
} from '../selectors/vaults';

/**
 * State containing user balances state
 */
export interface BalanceState {
  // we want to keep everything by address to be able to display the right
  // data even when the user quickly changes account
  byAddress: {
    [address: string]: {
      depositedVaultIds: {
        govVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
        standardVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
      };
      // computed total balance accounting for boost
      // mostly useful for the vault list
      deposited: {
        [vaultId: VaultEntity['id']]: { balance: BigNumber; shares: BigNumber };
      };
      rewards: {
        [vaultId: VaultEntity['id']]: { balance: BigNumber; shares: BigNumber };
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
          byChainId: {},
          deposited: {},
          depositedVaultIds: { govVaults: [], standardVaults: [] },
          rewards: {},
        };
      }

      const walletState = sliceState.byAddress[walletAddress];
      /**
       * Ingest token data
       */
      for (const tokenBalance of action.payload.data.tokens) {
        if (walletState.byChainId[chainId] === undefined) {
          walletState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForToken = walletState.byChainId[chainId].byTokenId[tokenBalance.tokenId];
        if (
          // only if balance is non-zero
          !tokenBalance.amount.isZero() &&
          // and state isn't already there
          // if it's there, only if amount differ
          (stateForToken === undefined || !stateForToken.balance.isEqualTo(tokenBalance.amount))
        ) {
          walletState.byChainId[chainId].byTokenId[tokenBalance.tokenId] = {
            balance: tokenBalance.amount,
          };

          // now, if this is a vault token, we want to mark this vault as deposited
          if (selectIsStandardVaultEarnTokenId(state, chainId, tokenBalance.tokenId)) {
            const vaultId = selectVaultByEarnTokenId(state, chainId, tokenBalance.tokenId);

            walletState.depositedVaultIds.standardVaults.push({ chainId, vaultId });

            // add to total balance
            const vault = selectVaultById(state, vaultId);
            const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
            const ppfs = selectVaultPricePerFullShare(state, vault.id);

            if (!walletState.deposited[vaultId]) {
              walletState.deposited[vaultId] = {
                balance: BIG_ZERO,
                shares: BIG_ZERO,
              };
            }
            const balanceSingle = byDecimals(
              new BigNumber(tokenBalance.amount).multipliedBy(byDecimals(ppfs)).toFixed(8),
              oracleToken.decimals
            );
            const vaultTotalState = walletState.deposited[vaultId];
            vaultTotalState.balance = vaultTotalState.balance.plus(balanceSingle);
            vaultTotalState.shares = vaultTotalState.shares.plus(tokenBalance.amount);
          }
        }
      }

      /**
       * Ingest boost data
       */
      for (const boostBalance of action.payload.data.boosts) {
        if (walletState.byChainId[chainId] === undefined) {
          walletState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForBoost = walletState.byChainId[chainId].byBoostId[boostBalance.boostId];
        if (
          stateForBoost === undefined ||
          !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
          !stateForBoost.rewards.isEqualTo(boostBalance.rewards)
        ) {
          walletState.byChainId[chainId].byBoostId[boostBalance.boostId] = {
            balance: boostBalance.balance,
            rewards: boostBalance.rewards,
          };
        }

        // add to total balance of the target vault
        const boost = selectBoostById(state, boostBalance.boostId);
        const vault = selectVaultById(state, boost.vaultId);
        const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
        const ppfs = selectVaultPricePerFullShare(state, vault.id);
        if (!walletState.deposited[vault.id]) {
          walletState.deposited[vault.id] = {
            balance: BIG_ZERO,
            shares: BIG_ZERO,
          };
        }
        const balanceSingle = byDecimals(
          boostBalance.balance.multipliedBy(byDecimals(ppfs)),
          oracleToken.decimals
        );
        const vaultTotalState = walletState.deposited[vault.id];
        vaultTotalState.balance = vaultTotalState.balance.plus(balanceSingle);
        vaultTotalState.shares = vaultTotalState.shares.plus(boostBalance.balance);
      }

      /**
       * Ingest gov vaults data
       */
      for (const vaultBalance of action.payload.data.govVaults) {
        const vaultId = vaultBalance.vaultId;
        if (walletState.byChainId[chainId] === undefined) {
          walletState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForVault = walletState.byChainId[chainId].byGovVaultId[vaultId];
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
          walletState.byChainId[chainId].byGovVaultId[vaultId] = vaultState;
          walletState.depositedVaultIds.govVaults.push({ chainId, vaultId });

          // add to vault balance
          const vault = selectVaultById(state, vaultId);
          const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);

          if (!walletState.deposited[vaultId]) {
            walletState.deposited[vaultId] = {
              balance: BIG_ZERO,
              shares: BIG_ZERO,
            };
          }
          const balanceSingle = byDecimals(vaultBalance.balance, oracleToken.decimals);
          const vaultDeposited = walletState.deposited[vaultId];
          vaultDeposited.balance = vaultDeposited.balance.plus(balanceSingle);
          vaultDeposited.shares = vaultDeposited.shares.plus(vaultBalance.balance);

          // add rewards too for gov vaults
          if (!walletState.rewards[vault.id]) {
            walletState.rewards[vault.id] = {
              balance: BIG_ZERO,
              shares: BIG_ZERO,
            };
          }
          const rewardsBalance = byDecimals(vaultBalance.rewards, oracleToken.decimals);
          const vaultRewards = walletState.deposited[vault.id];
          vaultRewards.balance = vaultRewards.balance.plus(rewardsBalance);
          vaultRewards.shares = vaultRewards.shares.plus(vaultBalance.rewards);
        }
      }
    });
  },
});
