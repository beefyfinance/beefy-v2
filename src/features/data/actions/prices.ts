import type {
  BeefyAPILpBreakdownResponse,
  BeefyAPITokenPricesResponse,
} from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type fetchAllPricesPayload = {
  prices: BeefyAPITokenPricesResponse;
  breakdowns: BeefyAPILpBreakdownResponse;
};
export const fetchAllPricesAction = createAppAsyncThunk<fetchAllPricesPayload, void>(
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
