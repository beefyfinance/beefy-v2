import type { CuratorConfig } from '../apis/config-types.ts';
import { getConfigApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchCuratorsPayload = CuratorConfig[];

export const fetchCurators = createAppAsyncThunk<FetchCuratorsPayload>(
  'curators/fetchCurators',
  async () => {
    const api = await getConfigApi();
    return await api.fetchCurators();
  }
);
