import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { BoostBalance, GovVaultPoolBalance } from '../apis/boost-balance';
import { getBoostBalanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
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
interface ActionParams {
  chainId: ChainEntity['id'];
}

export const fetchGovVaultPoolsBalanceAction = createAsyncThunk<
  FetchGovVaultPoolsBalanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('boost-balance/fetchGovVaultPoolsBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBoostBalanceApi(chain);

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
>('boost-balance/fetchBoostBalanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getBoostBalanceApi(chain);

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );

  const data = await api.fetchBoostBalance(boosts, walletAddress);
  return { chainId, data };
});
