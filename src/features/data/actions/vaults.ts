import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { VaultConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';

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
>('boosts/fetchAllVaults', async (_, { getState }) => {
  const api = getConfigApi();
  const vaults = await api.fetchAllVaults();
  return { byChainId: vaults, state: getState() };
});
