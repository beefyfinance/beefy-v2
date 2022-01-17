import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchPricesAction = createAsyncThunk<Awaited<ReturnType<BeefyAPI['getPrices']>>, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getPrices();
    return prices;
  }
);

export const fetchLPPricesAction = createAsyncThunk<Awaited<ReturnType<BeefyAPI['getLPs']>>, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getLPs();
    return prices;
  }
);
