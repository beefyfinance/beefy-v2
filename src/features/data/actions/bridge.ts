import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBridgeApi } from '../apis/instances';

export interface FulfilledBridgeData {
  data: unknown;
}

export const fetchBridgeTokenData = createAsyncThunk<
  FulfilledBridgeData,
  void,
  { state: BeefyState }
>('bridge/fetchBridgeTokenData', async () => {
  const api = getBridgeApi();
  const data = await api.getTokens();
  return { data };
});
