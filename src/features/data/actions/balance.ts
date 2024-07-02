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
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInShareToken,
} from '../selectors/balance';
import {
  selectAllVaultBoostIds,
  selectBoostById,
  selectBoostsByChainId,
} from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectCowcentratedVaultDepositTokens, selectTokenByAddress } from '../selectors/tokens';
import {
  selectAllGovVaultsByChainId,
  selectAllVaultIds,
  selectVaultById,
} from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import type { TokenEntity } from '../entities/token';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultEntity,
  type VaultGov,
} from '../entities/vault';
import { uniqueTokens } from '../../../helpers/tokens';
import { BIG_ZERO } from '../../../helpers/big-number';
import { entries } from '../../../helpers/object';
import type { BoostEntity } from '../entities/boost';

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
    const boosts: BoostEntity[] = [];

    if (vaults.length) {
      for (const vault of vaults) {
        if (isGovVault(vault)) {
          govVaults.push(vault);
        } else {
          if (isCowcentratedVault(vault)) {
            Object.values(selectCowcentratedVaultDepositTokens(state, vault.id)).forEach(token =>
              tokens.push(token)
            );
          } else {
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
  const allVaultIds = selectAllVaultIds(state);
  const depositedIds: VaultEntity['id'][] = [];

  for (const vaultId of allVaultIds) {
    let deposited = false;
    const vault = selectVaultById(state, vaultId);

    if (isStandardVault(vault) || isCowcentratedVault(vault)) {
      // standard vaults via receipt tokens
      const balance = selectUserBalanceOfToken(
        state,
        vault.chainId,
        vault.contractAddress,
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
      if (!deposited && isStandardVault(vault) && vault.bridged) {
        for (const [chainId, bridgedAddress] of entries(vault.bridged)) {
          const balance = selectUserBalanceOfToken(state, chainId, bridgedAddress, walletAddress);
          if (balance.gt(BIG_ZERO)) {
            deposited = true;
            break;
          }
        }
      }

      // + is the underlying of a clm reward pool
      if (!deposited && isCowcentratedVault(vault) && vault.cowcentratedGovId) {
        // user is marked as deposited in both the CLM + Reward Pool if either holds a balance
        // TODO why? does this make sense? [PNL breaks okay...]

        const balance = selectGovVaultUserStakedBalanceInDepositToken(
          state,
          vault.cowcentratedGovId,
          walletAddress
        );
        if (balance.gt(BIG_ZERO)) {
          deposited = true;
        }
      }
    } else if (isGovVault(vault)) {
      // standard gov balance contract calls
      const balance = selectGovVaultUserStakedBalanceInDepositToken(state, vault.id, walletAddress);
      if (balance.gt(BIG_ZERO)) {
        deposited = true;
      }

      // + has an underlying clm
      if (!deposited && isCowcentratedGovVault(vault)) {
        // user is marked as deposited in both the CLM + Reward Pool if either holds a balance
        // TODO why? does this make sense? [PNL breaks okay...]
        const balance = selectUserVaultBalanceInShareToken(
          state,
          vault.cowcentratedId,
          walletAddress
        );
        if (balance.gt(BIG_ZERO)) {
          deposited = true;
        }
      }
    }

    // add?
    if (deposited) {
      depositedIds.push(vault.id);
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
