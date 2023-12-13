import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import type { PlatformConfig } from '../apis/config-types';

export type FetchPlatformsPayload = PlatformConfig[];

export const fetchPlatforms = createAsyncThunk<FetchPlatformsPayload>(
  'platforms/fetchPlatforms',
  async () => {
    const api = await getConfigApi();
    return await api.fetchPlatforms();
  }
);
