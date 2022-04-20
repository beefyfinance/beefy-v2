import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { FeaturedVaultConfig, VaultConfig } from '../apis/config-types';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllVaultsPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: VaultConfig[];
  };
  state: BeefyState;
}
export const fetchAllVaults = createAsyncThunk<
  FulfilledAllVaultsPayload,
  {},
  { state: BeefyState }
>('vaults/fetchAllVaults', async (_, { getState }) => {
  const api = getConfigApi();
  const vaults = await api.fetchAllVaults();
  return { byChainId: vaults, state: getState() };
});

export interface FulfilledFeaturedVaultsPayload {
  byVaultId: FeaturedVaultConfig;
}
export const fetchFeaturedVaults = createAsyncThunk<FulfilledFeaturedVaultsPayload>(
  'vaults/fetchFeaturedVaults',
  async () => {
    const api = getConfigApi();
    const featuredVaults = await api.fetchFeaturedVaults();
    return { byVaultId: featuredVaults };
  }
);
