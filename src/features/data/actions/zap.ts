import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getConfigApi } from '../apis/instances';
import type { BeefyZapConfig, OneInchZapConfig } from '../apis/config-types';

interface FetchAllZapsFulfilledPayload {
  beefy: BeefyZapConfig[];
  oneInch: OneInchZapConfig[];
}

export const fetchAllZapsAction = createAsyncThunk<
  FetchAllZapsFulfilledPayload,
  void,
  { state: BeefyState }
>('zap/fetchAllZapsAction', async () => {
  const api = getConfigApi();
  const [beefy, oneInch] = await Promise.all([
    api.fetchBeefyZapsConfig(),
    api.fetchOneInchZapsConfig(),
  ]);

  return {
    beefy,
    oneInch,
  };
});
