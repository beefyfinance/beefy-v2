import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { byDecimals } from '../../../helpers/format';
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
import { accountHasChanged, walletHasDisconnected } from './wallet';

/**
 * State containing user balances state
 */
export interface BalanceState {
  depositedVaultIds: {
    govVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
    standardVaults: { chainId: ChainEntity['id']; vaultId: VaultEntity['id'] }[];
  };
  // computed total balance accounting for boost
  // mostly useful for the vault list
  deposited: {
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
}
export const initialBalanceState: BalanceState = {
  byChainId: {},
  deposited: {},
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
      const state = action.payload.state;
      const chainId = action.payload.chainId;

      /**
       * Ingest token data
       */
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
          if (selectIsStandardVaultEarnTokenId(state, chainId, tokenBalance.tokenId)) {
            const vaultId = selectVaultByEarnTokenId(state, chainId, tokenBalance.tokenId);

            sliceState.depositedVaultIds.standardVaults.push({ chainId, vaultId });

            // add to total balance
            const vault = selectVaultById(state, vaultId);
            const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
            const ppfs = selectVaultPricePerFullShare(state, vault.id);

            if (!sliceState.deposited[vaultId]) {
              sliceState.deposited[vaultId] = {
                balance: new BigNumber(0),
                shares: new BigNumber(0),
              };
            }
            const balanceSingle = byDecimals(
              new BigNumber(tokenBalance.amount).multipliedBy(byDecimals(ppfs)).toFixed(8),
              oracleToken.decimals
            );
            const vaultTotalState = sliceState.deposited[vaultId];
            vaultTotalState.balance = vaultTotalState.balance.plus(balanceSingle);
            vaultTotalState.shares = vaultTotalState.shares.plus(tokenBalance.amount);
          }
        }
      }

      /**
       * Ingest boost data
       */
      for (const boostBalance of action.payload.data.boosts) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForBoost = sliceState.byChainId[chainId].byBoostId[boostBalance.boostId];
        if (
          stateForBoost === undefined ||
          !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
          !stateForBoost.rewards.isEqualTo(boostBalance.rewards)
        ) {
          sliceState.byChainId[chainId].byBoostId[boostBalance.boostId] = {
            balance: boostBalance.balance,
            rewards: boostBalance.rewards,
          };
        }

        // add to total balance of the target vault
        const boost = selectBoostById(state, boostBalance.boostId);
        const vault = selectVaultById(state, boost.vaultId);
        const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
        const ppfs = selectVaultPricePerFullShare(state, vault.id);
        if (!sliceState.deposited[vault.id]) {
          sliceState.deposited[vault.id] = {
            balance: new BigNumber(0),
            shares: new BigNumber(0),
          };
        }
        const balanceSingle = byDecimals(
          boostBalance.balance.multipliedBy(byDecimals(ppfs)),
          oracleToken.decimals
        );
        const vaultTotalState = sliceState.deposited[vault.id];
        vaultTotalState.balance = vaultTotalState.balance.plus(balanceSingle);
        vaultTotalState.shares = vaultTotalState.shares.plus(boostBalance.balance);
      }

      /**
       * Ingest gov vaults data
       */
      for (const vaultBalance of action.payload.data.govVaults) {
        const vaultId = vaultBalance.vaultId;
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byTokenId: {}, byBoostId: {}, byGovVaultId: {} };
        }

        // only update data if necessary
        const stateForVault = sliceState.byChainId[chainId].byGovVaultId[vaultId];
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
          sliceState.byChainId[chainId].byGovVaultId[vaultId] = vaultState;
          sliceState.depositedVaultIds.govVaults.push({ chainId, vaultId });

          // add to total balance
          const vault = selectVaultById(state, vaultId);
          const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);

          if (!sliceState.deposited[vaultId]) {
            sliceState.deposited[vaultId] = {
              balance: new BigNumber(0),
              shares: new BigNumber(0),
            };
          }
          const balanceSingle = byDecimals(vaultBalance.balance, oracleToken.decimals);
          const vaultTotalState = sliceState.deposited[vaultId];
          vaultTotalState.balance = vaultTotalState.balance.plus(balanceSingle);
          vaultTotalState.shares = vaultTotalState.shares.plus(vaultBalance.balance);
        }
      }
    });
  },
});
