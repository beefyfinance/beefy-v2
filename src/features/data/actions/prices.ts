import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBeefyApi } from '../apis/instances.ts';
import type {
  BeefyAPILpBreakdownResponse,
  BeefyAPITokenPricesResponse,
} from '../apis/beefy/beefy-api-types.ts';

export type fetchAllPricesPayload = {
  prices: BeefyAPITokenPricesResponse;
  breakdowns: BeefyAPILpBreakdownResponse;
};
export const fetchAllPricesAction = createAsyncThunk<fetchAllPricesPayload, void>(
  'prices/fetchAllPricesAction',
  async () => {
    const api = await getBeefyApi();
    const [prices, breakdowns] = await Promise.all([api.getPrices(), api.getLpsBreakdown()]);

    return {
      prices,
      breakdowns,
    };
  }
);
