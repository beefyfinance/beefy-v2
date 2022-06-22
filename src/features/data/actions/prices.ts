import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  BeefyAPIBuybackResponse,
  BeefyAPILpBreakdownResponse,
  BeefyAPITokenPricesResponse,
} from '../apis/beefy';
import { getBeefyApi } from '../apis/instances';

export type fetchAllPricesPayload = {
  prices: BeefyAPITokenPricesResponse;
  breakdowns: BeefyAPILpBreakdownResponse;
};
export const fetchAllPricesAction = createAsyncThunk<fetchAllPricesPayload, void>(
  'prices/fetchAllPricesAction',
  async () => {
    const api = getBeefyApi();
    const [prices, breakdowns] = await Promise.all([api.getPrices(), api.getLpsBreakdown()]);

    return {
      prices,
      breakdowns,
    };
  }
);

export const fetchBeefyBuybackAction = createAsyncThunk<BeefyAPIBuybackResponse, void>(
  'prices/fetchBeefyBuybackAction',
  async () => {
    const api = getBeefyApi();
    return api.getBuyBack();
  }
);
