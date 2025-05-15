import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { uniqueTokens } from '../../../helpers/tokens.ts';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types.ts';
import { getBalanceApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { TokenEntity } from '../entities/token.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isErc4626Vault,
  isGovVault,
  type VaultEntity,
  type VaultErc4626,
  type VaultGov,
} from '../entities/vault.ts';
import {
  selectAllTokenWhereUserCouldHaveBalance,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
} from '../selectors/balance.ts';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts.ts';
import { selectChainById } from '../selectors/chains.ts';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectTokenByAddress,
} from '../selectors/tokens.ts';
import {
  selectAllErc4626VaultsByChainId,
  selectAllGovVaultsByChainId,
  selectAllVisibleVaultIds,
} from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

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

export const fetchAllBalanceAction = createAppAsyncThunk<
  FetchAllBalanceFulfilledPayload,
  FetchAllBalanceActionParams
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
  const erc4626Vaults: VaultErc4626[] = selectAllErc4626VaultsByChainId(state, chain.id);

  const data = await api.fetchAllBalances(
    getState(),
    { tokens, govVaults, boosts, erc4626Vaults },
    walletAddress
  );
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

export const fetchBalanceAction = createAppAsyncThunk<
  FetchAllBalanceFulfilledPayload,
  FetchBalanceParams
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
    const erc4626Vaults: VaultErc4626[] = [];

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
          if (isErc4626Vault(vault)) {
            erc4626Vaults.push(vault);
          }
          tokens.push(selectTokenByAddress(state, chain.id, vault.receiptTokenAddress));
        }
      }
    }

    const data = await api.fetchAllBalances(
      getState(),
      {
        tokens: uniqueTokens(tokens),
        govVaults,
        boosts,
        erc4626Vaults,
      },
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

export const recalculateDepositedVaultsAction = createAppAsyncThunk<
  RecalculateDepositedVaultsPayload,
  RecalculateDepositedVaultsParams
>('balance/recalculateDepositedVaultsAction', async ({ walletAddress }, { getState }) => {
  const state = getState();
  const allVaultIds = selectAllVisibleVaultIds(state);
  const depositedIds: VaultEntity['id'][] = [];

  for (const vaultId of allVaultIds) {
    const balance = selectUserVaultBalanceInShareTokenIncludingDisplaced(
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
