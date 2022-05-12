import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBridgeApi, getConfigApi } from '../apis/instances';

export interface FulfilledBridgeData {
  data: unknown;
}

export const fetchBridgeTokenData = createAsyncThunk<
  FulfilledBridgeData,
  void,
  { state: BeefyState }
>('bridge/fetchBridgeTokenData', async () => {
  const configApi = getConfigApi();
  const chains = await configApi.fetchChainConfigs();
  const api = getBridgeApi();
  const data = await api.getBridgeData(chains);
  return { data };
});
