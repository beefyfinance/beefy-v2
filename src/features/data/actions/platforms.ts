import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPlatformApi } from '../apis/instances';
import { PlatformConfig } from '../apis/platform/platform-types';

export type FetchPlatformsPayload = PlatformConfig[];

export const fetchPlatforms = createAsyncThunk<FetchPlatformsPayload>(
  'platforms/fetchPlatforms',
  async () => {
    const api = getPlatformApi();
    return await api.fetchPlatforms();
  }
);
