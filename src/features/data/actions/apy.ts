import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { BeefyAPIApyBreakdownResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export interface FetchAllApyFulfilledPayload {
  data: BeefyAPIApyBreakdownResponse;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchApyAction = createAsyncThunk<
  FetchAllApyFulfilledPayload,
  {},
  { state: BeefyState }
>('prices/fetchApy', async (_, { getState }) => {
  const api = getBeefyApi();
  const prices = await api.getApyBreakdown();
  return { data: prices, state: getState() };
});
