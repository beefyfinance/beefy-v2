import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChainConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';

export interface FulfilledPayload {
  chainConfigs: ChainConfig[];
}

export const fetchChainConfigs = createAsyncThunk<FulfilledPayload>(
  'chains/fetchChainConfigs',
  async (params, config) => {
    const api = getConfigApi();
    const chainConfigs = await api.fetchChainConfigs();
    return { chainConfigs };
  }
);
