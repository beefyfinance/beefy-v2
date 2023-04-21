import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api';
import { getBeefyApi } from '../apis/instances';

export interface FetchAllApyFulfilledPayload {
  data: BeefyAPIApyBreakdownResponse;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchApyAction = createAsyncThunk<
  FetchAllApyFulfilledPayload,
  void,
  { state: BeefyState }
>('prices/fetchApy', async (_, { getState }) => {
  const api = getBeefyApi();
  const prices = await api.getApyBreakdown();
  return { data: prices, state: getState() };
});
