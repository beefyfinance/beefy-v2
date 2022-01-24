import { createAsyncThunk } from '@reduxjs/toolkit';
import { VaultConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledPayload {
  chainId: ChainEntity['id'];
  pools: VaultConfig[];
}
interface ActionParams {
  chainId: ChainEntity['id'];
}
export const fetchVaultByChainIdAction = createAsyncThunk<FulfilledPayload, ActionParams>(
  'vaults/fetchVaultListForChain',
  async ({ chainId }) => {
    const api = getConfigApi();
    const pools = await api.fetchVaultByChainId(chainId);
    return { chainId, pools };
  }
);
