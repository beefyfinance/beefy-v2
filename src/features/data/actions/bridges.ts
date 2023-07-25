import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import type { BridgeConfig } from '../apis/config-types';

export type FetchBridgesPayload = BridgeConfig[];

export const fetchBridges = createAsyncThunk<FetchBridgesPayload>(
  'bridges/fetchBridges',
  async () => {
    const api = getConfigApi();
    return await api.fetchBridges();
  }
);
