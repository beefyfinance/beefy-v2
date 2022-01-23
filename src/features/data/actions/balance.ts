import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { BoostBalance, GovVaultPoolBalance, TokenBalance } from '../apis/balance';
import { getBalanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectAllTokenByChain, selectTokenById } from '../selectors/tokens';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

export interface FetchGovVaultPoolsBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: GovVaultPoolBalance[];
}
export interface FetchBoostBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: BoostBalance[];
}
export interface FetchTokenBalanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: TokenBalance[];
}

interface ActionParams {
  chainId: ChainEntity['id'];
}

export const fetchGovVaultPoolsBalanceAction = createAsyncThunk<
  FetchGovVaultPoolsBalanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('balance/fetchGovVaultPoolsBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBalanceApi(chain);

  // maybe have a way to retrieve those easily
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const govVaults = allVaults.filter(v => isGovVault(v)) as VaultGov[];

  const data = await api.fetchGovVaultPoolsBalance(govVaults, walletAddress);
  return { chainId, data };
});

export const fetchBoostBalanceAction = createAsyncThunk<
  FetchBoostBalanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('balance/fetchBoostBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBalanceApi(chain);

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );

  const data = await api.fetchBoostBalance(boosts, walletAddress);
  return { chainId, data };
});

export const fetchTokenBalanceAction = createAsyncThunk<
  FetchTokenBalanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('balance/fetchTokenBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBalanceApi(chain);

  const tokens = selectAllTokenByChain(state, chainId).map(tokenId =>
    selectTokenById(state, chain.id, tokenId)
  );
  const data = await api.fetchTokenBalances(tokens, walletAddress);
  return { chainId, data };
});
