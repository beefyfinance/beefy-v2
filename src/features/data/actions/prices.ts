import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  BeefyAPILpBreakdownResponse,
  BeefyAPITokenPricesResponse,
} from '../apis/beefy/beefy-api';
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
