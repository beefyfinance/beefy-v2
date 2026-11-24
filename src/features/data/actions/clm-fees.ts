import type { BeefyApiClmSwapFeesResponse } from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchClmFeesFulfilledPayload = {
  byVaultId: BeefyApiClmSwapFeesResponse;
};

export const fetchClmFeesAction = createAppAsyncThunk<FetchClmFeesFulfilledPayload>(
  'vaults/fetchClmFees',
  async () => {
    const api = await getBeefyApi();
    return { byVaultId: await api.getClmSwapFees() };
  }
);
