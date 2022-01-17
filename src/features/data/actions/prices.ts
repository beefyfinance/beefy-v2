import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI, BeefyAPITolenPricesResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchPricesAction = createAsyncThunk<BeefyAPITolenPricesResponse, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getPrices();
    return prices;
  }
);

export const fetchLPPricesAction = createAsyncThunk<BeefyAPITolenPricesResponse, {}>(
  'prices/fetchPrices',
  async () => {
    const api = await getBeefyApi();
    const prices = await api.getLPs();
    return prices;
  }
);
