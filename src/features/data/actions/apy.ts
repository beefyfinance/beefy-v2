import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchApyAction = createAsyncThunk<Awaited<ReturnType<BeefyAPI['getBreakdown']>>, {}>(
  'prices/fetchApy',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getBreakdown();
    return prices;
  }
);

export const fetchHistoricalApy = createAsyncThunk<
  Awaited<ReturnType<BeefyAPI['getHistoricalAPY']>>,
  {}
>('prices/fetchHistoricalApy', async () => {
  const api = await getBeefyApi();
  const prices = await api.getHistoricalAPY();
  return prices;
});
