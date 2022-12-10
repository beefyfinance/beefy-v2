import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { getBalanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { selectAllTokenWhereUserCouldHaveBalance } from '../selectors/balance';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectTokenByAddress } from '../selectors/tokens';
import { selectAllGovVaultsByChainId } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity } from '../entities/vault';
import { uniqueTokens } from '../../../helpers/tokens';

interface ActionParams {
  chainId: ChainEntity['id'];
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
  ActionParams,
  { state: BeefyState }
>('balance/fetchAllBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
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
