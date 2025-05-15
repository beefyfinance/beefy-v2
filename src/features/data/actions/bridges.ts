import type { BridgeConfig } from '../apis/config-types.ts';
import { getConfigApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchBridgesPayload = BridgeConfig[];

export const fetchBridges = createAppAsyncThunk<FetchBridgesPayload>(
  'bridges/fetchBridges',
  async () => {
    const api = await getConfigApi();
    return await api.fetchBridges();
  }
);
