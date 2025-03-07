import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances.ts';
import type { PartnersConfig } from '../apis/config-types.ts';

export const fetchPartnersConfig = createAsyncThunk<PartnersConfig>(
  'vaults/fetchPartnersConfig',
  async () => {
    const api = await getConfigApi();
    return api.fetchPartnersConfig();
  }
);
