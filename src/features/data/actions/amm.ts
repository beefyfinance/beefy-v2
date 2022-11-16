import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { AmmConfig } from '../apis/config-types';

interface FetchAllAmmsFulfilledPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: AmmConfig[];
  };
}

export const fetchAllAmmsAction = createAsyncThunk<
  FetchAllAmmsFulfilledPayload,
  void,
  { state: BeefyState }
>('zap/fetchAllAmmsAction', async () => {
  const api = getConfigApi();
  const amms = await api.fetchAmmsConfig();
  return { byChainId: amms };
});
