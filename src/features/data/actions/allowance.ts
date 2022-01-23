import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { BoostAllowance, VaultAllowance } from '../apis/allowance';
import { getAllowanceApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { isGovVault, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById, selectBoostsByChainId } from '../selectors/boosts';
import { selectChainById } from '../selectors/chains';
import { selectVaultByChainId, selectVaultById } from '../selectors/vaults';
import { selectWalletAddress } from '../selectors/wallet';

export interface FetchGovVaultPoolsAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: VaultAllowance[];
}
export interface FetchStandardVaultAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: VaultAllowance[];
}
export interface FetchBoostAllowanceFulfilledPayload {
  chainId: ChainEntity['id'];
  data: BoostAllowance[];
}

interface ActionParams {
  chainId: ChainEntity['id'];
}

export const fetchGovVaultPoolsAllowanceAction = createAsyncThunk<
  FetchGovVaultPoolsAllowanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('allowance/fetchGovVaultPoolsAllowanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

  // maybe have a way to retrieve those easily
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const govVaults = allVaults.filter(v => isGovVault(v)) as VaultGov[];

  // always re-fetch state as late as possible
  const data = await api.fetchGovVaultPoolAllowance(getState(), govVaults, walletAddress);
  return { chainId, data };
});

export const fetchStandardVaultAllowanceAction = createAsyncThunk<
  FetchStandardVaultAllowanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('allowance/fetchStandardVaultAllowanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

  // maybe have a way to retrieve those easily
  const allVaults = selectVaultByChainId(state, chainId).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  const standardVaults = allVaults.filter(v => !isGovVault(v)) as VaultStandard[];

  // always re-fetch state as late as possible
  const data = await api.fetchStandardVaultAllowance(getState(), standardVaults, walletAddress);
  return { chainId, data };
});

export const fetchBoostAllowanceAction = createAsyncThunk<
  FetchBoostAllowanceFulfilledPayload,
  ActionParams,
  { state: BeefyState }
>('allowance/fetchBoostAllowanceAction', async ({ chainId }, { getState }) => {
  const state = getState();

  const walletAddress = selectWalletAddress(state);
  const chain = selectChainById(state, chainId);
  const api = await getAllowanceApi(chain);

  // maybe have a way to retrieve those easily
  const boosts = selectBoostsByChainId(state, chainId).map(boostId =>
    selectBoostById(state, boostId)
  );

  // always re-fetch state as late as possible
  const data = await api.fetchBoostAllowance(getState(), boosts, walletAddress);
  return { chainId, data };
});
