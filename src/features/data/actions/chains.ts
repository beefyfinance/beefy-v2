import { createAsyncThunk } from '@reduxjs/toolkit';
import { ChainConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';

export interface FulfilledPayload {
  chainConfigs: ChainConfig[];
}
interface ActionParams {}

export const fetchChainConfigs = createAsyncThunk<FulfilledPayload, ActionParams>(
  'chains/fetchChainConfigs',
  async () => {
    const api = await getConfigApi();
    const chainConfigs = await api.fetchChainConfigs();
    return { chainConfigs };
  }
);
