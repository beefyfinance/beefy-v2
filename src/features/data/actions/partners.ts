import { createAsyncThunk } from '@reduxjs/toolkit';
import { PartnersConfig } from '../../../config/all-config';
import { getConfigApi } from '../apis/instances';

export const fetchPartnersConfig = createAsyncThunk<PartnersConfig>(
  'vaults/fetchPartnersConfig',
  async () => {
    const api = getConfigApi();
    return api.fetchPartnersConfig();
  }
);
