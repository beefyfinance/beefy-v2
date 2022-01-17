import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPITokenPricesResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchPricesAction = createAsyncThunk<BeefyAPITokenPricesResponse, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getPrices();
    return prices;
  }
);

export const fetchLPPricesAction = createAsyncThunk<BeefyAPITokenPricesResponse, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getLPs();
    return prices;
  }
);
