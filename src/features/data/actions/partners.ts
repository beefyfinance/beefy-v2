import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import { PartnersConfig } from '../apis/config-types';

export const fetchPartnersConfig = createAsyncThunk<PartnersConfig>(
  'vaults/fetchPartnersConfig',
  async () => {
    const api = getConfigApi();
    return api.fetchPartnersConfig();
  }
);
