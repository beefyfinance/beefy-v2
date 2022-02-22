import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { BeefyAPIBreakdownResponse, BeefyAPIHistoricalAPYResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export interface FetchAllApyFulfilledPayload {
  data: BeefyAPIBreakdownResponse;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchApyAction = createAsyncThunk<
  FetchAllApyFulfilledPayload,
  {},
  { state: BeefyState }
>('prices/fetchApy', async (_, { getState }) => {
  const api = getBeefyApi();
  const prices = await api.getBreakdown();
  return { data: prices, state: getState() };
});

export const fetchHistoricalApy = createAsyncThunk<BeefyAPIHistoricalAPYResponse, {}>(
  'prices/fetchHistoricalApy',
  async () => {
    const api = getBeefyApi();
    const prices = await api.getHistoricalAPY();
    return prices;
  }
);
