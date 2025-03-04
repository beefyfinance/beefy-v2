import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances.ts';
import type { BridgeConfig } from '../apis/config-types.ts';

export type FetchBridgesPayload = BridgeConfig[];

export const fetchBridges = createAsyncThunk<FetchBridgesPayload>(
  'bridges/fetchBridges',
  async () => {
    const api = await getConfigApi();
    return await api.fetchBridges();
  }
);
