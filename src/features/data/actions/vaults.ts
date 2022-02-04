import { createAsyncThunk } from '@reduxjs/toolkit';
import { VaultConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledAllVaultsPayload {
  [chainId: ChainEntity['id']]: VaultConfig[];
}
export const fetchAllVaults = createAsyncThunk<FulfilledAllVaultsPayload>(
  'boosts/fetchAllVaults',
  async () => {
    const api = getConfigApi();
    return api.fetchAllVaults();
  }
);
