import { createAsyncThunk } from '@reduxjs/toolkit';
import { BoostConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with

export interface FulfilledPayload {
  chainId: ChainEntity['id'];
  boosts: BoostConfig[];
}
interface ActionParams {
  chainId: ChainEntity['id'];
}
export const fetchBoostsByChainIdAction = createAsyncThunk<FulfilledPayload, ActionParams>(
  'boosts/fetchBoostsListForChain',
  async ({ chainId }) => {
    const api = getConfigApi();
    const boosts = await api.fetchBoostsByChainId(chainId);
    return { chainId, boosts };
  }
);
