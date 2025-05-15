import type { PlatformConfig } from '../apis/config-types.ts';
import { getConfigApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchPlatformsPayload = PlatformConfig[];

export const fetchPlatforms = createAppAsyncThunk<FetchPlatformsPayload>(
  'platforms/fetchPlatforms',
  async () => {
    const api = await getConfigApi();
    return await api.fetchPlatforms();
  }
);
