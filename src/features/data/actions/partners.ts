import type { PartnersConfig } from '../apis/config-types.ts';
import { getConfigApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export const fetchPartnersConfig = createAppAsyncThunk<PartnersConfig>(
  'vaults/fetchPartnersConfig',
  async () => {
    const api = await getConfigApi();
    return api.fetchPartnersConfig();
  }
);
