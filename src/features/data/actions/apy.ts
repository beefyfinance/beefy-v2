import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPIBreakdownResponse, BeefyAPIHistoricalAPYResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchApyAction = createAsyncThunk<BeefyAPIBreakdownResponse, {}>(
  'prices/fetchApy',
  async () => {
    const api = getBeefyApi();
    const prices = await api.getBreakdown();
    return prices;
  }
);

export const fetchHistoricalApy = createAsyncThunk<BeefyAPIHistoricalAPYResponse, {}>(
  'prices/fetchHistoricalApy',
  async () => {
    const api = getBeefyApi();
    const prices = await api.getHistoricalAPY();
    return prices;
  }
);
