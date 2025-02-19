import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getBalanceApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import {
  selectAllTokenWhereUserCouldHaveBalance,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInShareTokenIncludingBoostsBridged,
} from '../selectors/balance';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectTokenByAddress,
} from '../selectors/tokens';
import { selectAllGovVaultsByChainId, selectAllVisibleVaultIds } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import type { TokenEntity } from '../entities/token';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isGovVault,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault';
import { uniqueTokens } from '../../../helpers/tokens';
import { BIG_ZERO } from '../../../helpers/big-number';
import type { BoostPromoEntity } from '../entities/promo';

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

  const data = await api.fetchAllBalances(getState(), tokens, govVaults, boosts, walletAddress);
  return {
    chainId,
    walletAddress,
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
    if (!walletAddress) {
      throw new Error('No wallet address');
    }
    const chain = selectChainById(state, chainId);
    const api = await getBalanceApi(chain);

    const tokens = requestedTokens;
    const govVaults: VaultGov[] = [];
    const boosts: BoostPromoEntity[] = [];

    if (vaults.length) {
      for (const vault of vaults) {
        if (isGovVault(vault)) {
          govVaults.push(vault);
        } else {
          if (isCowcentratedLikeVault(vault)) {
            selectCowcentratedLikeVaultDepositTokens(state, vault.id).forEach(token =>
              tokens.push(token)
            );
          }
          if (!isCowcentratedVault(vault)) {
            tokens.push(selectTokenByAddress(state, chain.id, vault.depositTokenAddress));
          }
          tokens.push(selectTokenByAddress(state, chain.id, vault.receiptTokenAddress));
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
  fromTimelineListener?: boolean;
};

export type RecalculateDepositedVaultsPayload = {
  walletAddress: string;
  vaultIds: VaultEntity['id'][];
  addedVaultIds: VaultEntity['id'][];
};

export const recalculateDepositedVaultsAction = createAsyncThunk<
  RecalculateDepositedVaultsPayload,
  RecalculateDepositedVaultsParams,
  { state: BeefyState }
>('balance/recalculateDepositedVaultsAction', async ({ walletAddress }, { getState }) => {
  const state = getState();
  const allVaultIds = selectAllVisibleVaultIds(state);
  const depositedIds: VaultEntity['id'][] = [];

  for (const vaultId of allVaultIds) {
    const balance = selectUserVaultBalanceInShareTokenIncludingBoostsBridged(
      state,
      vaultId,
      walletAddress
    );
    if (balance.gt(BIG_ZERO)) {
      depositedIds.push(vaultId);
    }
  }

  const existingVaultIds = selectUserDepositedVaultIds(state, walletAddress);
  const addedVaultIds = depositedIds.filter(id => !existingVaultIds.includes(id));

  return {
    walletAddress,
    vaultIds: depositedIds,
    addedVaultIds,
  };
});
