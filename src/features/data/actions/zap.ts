import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { ZapConfig } from '../apis/config';
import { getConfigApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';

export interface FetchAllZapFulfilledPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: ZapConfig[];
  };
  // reducers need the state (balance)
  state: BeefyState;
}

// TODO: To be more efficient we could only load zaps for one chain at a time
export const fetchAllZapsAction = createAsyncThunk<
  FetchAllZapFulfilledPayload,
  {},
  { state: BeefyState }
>('zap/fetchAllZapsAction', async (_, { getState }) => {
  const api = getConfigApi();
  const zaps = await api.fetchZapsConfig();
  return { byChainId: zaps, state: getState() };
});
