import type { VaultEntity } from '../entities/vault.ts';
import { getConfigApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchFeaturedVaultsPayload = VaultEntity['id'][];

export const fetchFeaturedVaults = createAppAsyncThunk<FetchFeaturedVaultsPayload>(
  'featuredVaults/fetchFeaturedVaults',
  async () => {
    const api = await getConfigApi();
    return await api.fetchFeaturedVaults();
  }
);
