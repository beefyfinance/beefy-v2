import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import { ChainConfig } from '../apis/config-types';

export interface FulfilledPayload {
  chainConfigs: ChainConfig[];
}

export const fetchChainConfigs = createAsyncThunk<FulfilledPayload>(
  'chains/fetchChainConfigs',
  async () => {
    const api = getConfigApi();
    const chainConfigs = await api.fetchChainConfigs();
    return { chainConfigs };
  }
);
