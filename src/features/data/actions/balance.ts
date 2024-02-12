import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getBalanceApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import {
  selectAllTokenWhereUserCouldHaveBalance,
  selectBoostUserBalanceInToken,
  selectGovVaultUserStakedBalanceInDepositToken,
  selectUserBalanceOfToken,
} from '../selectors/balance';
import {
  selectAllVaultBoostIds,
  selectBoostById,
  selectBoostsByChainId,
} from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectTokenByAddress } from '../selectors/tokens';
import {
  selectAllGovVaultsByChainId,
  selectAllVaultIds,
  selectVaultById,
} from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import type { TokenEntity } from '../entities/token';
import { isGovVault, isStandardVault, type VaultEntity } from '../entities/vault';
import { uniqueTokens } from '../../../helpers/tokens';
import { BIG_ZERO } from '../../../helpers/big-number';
import { BigNumber } from 'bignumber.js';

export interface FetchAllBalanceActionParams {
  chainId: ChainEntity['id'];
  walletAddress: string;
}

export interface FetchAllBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  walletAddress: string;
  data: FetchAllBalancesResult;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchAllBalanceAction = createAsyncThunk<
  FetchAllBalanceFulfilledPayload,
  FetchAllBalanceActionParams,
  { state: BeefyState }
>('balance/fetchAllBalanceAction', async ({ chainId, walletAddress }, { getState }) => {
  const state = getState();

  const userAddress = walletAddress ?? selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBalanceApi(chain);

  const tokens = selectAllTokenWhereUserCouldHaveBalance(state, chainId).map(address =>
    selectTokenByAddress(state, chain.id, address)
  );

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );
  const govVaults = selectAllGovVaultsByChainId(state, chain.id);

  const data = await api.fetchAllBalances(getState(), tokens, govVaults, boosts, userAddress);
  return {
    chainId,
    walletAddress: userAddress,
    data,
    state: getState(),
  };
});

export type FetchBalanceParams = {
  chainId: ChainEntity['id'];
  tokens?: TokenEntity[];
  vaults?: VaultEntity[];
};

export const fetchBalanceAction = createAsyncThunk<
  FetchAllBalanceFulfilledPayload,
  FetchBalanceParams,
  { state: BeefyState }
>(
  'balance/fetchBalanceAction',
  async ({ chainId, tokens: requestedTokens = [], vaults = [] }, { getState }) => {
    const state = getState();

    const walletAddress = selectWalletAddress(state);
    const chain = selectChainById(state, chainId);
    const api = await getBalanceApi(chain);

    const tokens = requestedTokens;
    const govVaults = [];
    const boosts = [];

    if (vaults.length) {
      for (const vault of vaults) {
        if (isGovVault(vault)) {
          govVaults.push(vault);
        } else {
          tokens.push(selectTokenByAddress(state, chain.id, vault.depositTokenAddress));
          tokens.push(selectTokenByAddress(state, chain.id, vault.earnedTokenAddress));
        }
      }
    }

    const data = await api.fetchAllBalances(
      getState(),
      uniqueTokens(tokens),
      govVaults,
      boosts,
      walletAddress
    );

    return {
      chainId,
      walletAddress,
      data,
      state: getState(),
    };
  }
);

export type RecalculateDepositedVaultsParams = {
  walletAddress: string;
};

export type RecalculateDepositedVaultsPayload = {
  walletAddress: string;
  vaultIds: VaultEntity['id'][];
};

export const recalculateDepositedVaultsAction = createAsyncThunk<
  RecalculateDepositedVaultsPayload,
  RecalculateDepositedVaultsParams,
  { state: BeefyState }
>('balance/recalculateDepositedVaultsAction', async ({ walletAddress }, { getState }) => {
  const state = getState();
  const allVaultIds = selectAllVaultIds(state);
  const depositedIds: VaultEntity['id'][] = [];

  for (const vaultId of allVaultIds) {
    const vault = selectVaultById(state, vaultId);

    if (isStandardVault(vault)) {
      // standard vaults via receipt tokens
      let deposited = false;
      const balance = selectUserBalanceOfToken(
        state,
        vault.chainId,
        vault.earnContractAddress,
        walletAddress
      );
      if (balance.gt(BIG_ZERO)) {
        deposited = true;
      }

      // + boosts
      if (!deposited) {
        const boostIds = selectAllVaultBoostIds(state, vault.id);
        for (const boostId of boostIds) {
          const balance = selectBoostUserBalanceInToken(state, boostId, walletAddress);
          if (balance.gt(BIG_ZERO)) {
            deposited = true;
            break;
          }
        }
      }

      // + bridged
      if (!deposited && vault.bridged) {
        for (const [chainId, bridgedAddress] of Object.entries(vault.bridged)) {
          const balance = selectUserBalanceOfToken(state, chainId, bridgedAddress, walletAddress);
          if (balance.gt(BIG_ZERO)) {
            deposited = true;
            break;
          }
        }
      }

      // add?
      if (deposited) {
        depositedIds.push(vault.id);
      }
    } else if (isGovVault(vault)) {
      const balance = selectGovVaultUserStakedBalanceInDepositToken(state, vault.id, walletAddress);
      if (balance.gt(BIG_ZERO)) {
        depositedIds.push(vault.id);
      }
    }
  }

  return {
    walletAddress,
    vaultIds: depositedIds,
  };
});

export type FetchWormholeBalanceParams = { walletAddress: string };
export type FetchWormholeBalanceFulfilledPayload = {
  walletAddress: string;
  bridged: BigNumber;
  pendingRewards: BigNumber;
};

export const fetchWormholeBalanceAction = createAsyncThunk<
  FetchWormholeBalanceFulfilledPayload,
  FetchWormholeBalanceParams,
  { state: BeefyState }
>('balance/fetchWormholeBalanceAction', async ({ walletAddress }) => {
  const params = new URLSearchParams({ address: walletAddress });
  const response = await fetch(`https://wac.gfx.xyz/usersummary?${params}`);
  const data = (await response.json()) as {
    bridged_amount: number;
    pending_rewards: number;
    moo_cusdc_held: number;
  };

  return {
    walletAddress,
    bridged: new BigNumber(data.bridged_amount),
    pendingRewards: new BigNumber(data.pending_rewards),
  };
});
