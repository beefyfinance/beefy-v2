import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChainConfig } from '../../../config/all-config';
import { getConfigApi } from '../apis/instances';

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
