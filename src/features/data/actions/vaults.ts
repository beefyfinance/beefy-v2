import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi, getConfigApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import type { VaultConfig } from '../apis/config-types';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllVaultsPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: VaultConfig[];
  };
  state: BeefyState;
}
export const fetchAllVaults = createAsyncThunk<
  FulfilledAllVaultsPayload,
  void,
  { state: BeefyState }
>('vaults/fetchAllVaults', async (_, { getState }) => {
  const api = await getConfigApi();
  const vaults = await api.fetchAllVaults();
  return { byChainId: vaults, state: getState() };
});

type FulfilledVaultsLastHarvestPayload = {
  byVaultId: { [vaultId: VaultConfig['id']]: number };
};

export const fetchVaultsLastHarvests = createAsyncThunk<FulfilledVaultsLastHarvestPayload>(
  'vaults/last-harvest',
  async () => {
    const api = await getBeefyApi();
    const vaults = await api.getVaultLastHarvest();
    return { byVaultId: vaults };
  }
);
