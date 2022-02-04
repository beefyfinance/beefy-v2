import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPIBuybackResponse, BeefyAPITokenPricesResponse } from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export const fetchAllPricesAction = createAsyncThunk<BeefyAPITokenPricesResponse, {}>(
  'prices/fetchAllPricesAction',
  async () => {
    const api = getBeefyApi();
    const [prices, lpPrices] = await Promise.all([api.getPrices(), api.getLPs()]);
    return {
      ...prices,
      ...lpPrices,
    };
  }
);

export const fetchBeefyBuybackAction = createAsyncThunk<BeefyAPIBuybackResponse, {}>(
  'prices/fetchBeefyBuybackAction',
  async () => {
    const api = getBeefyApi();
    return api.getBuyBack();
  }
);
