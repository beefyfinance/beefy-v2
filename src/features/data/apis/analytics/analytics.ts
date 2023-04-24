import type { AxiosInstance } from 'axios';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  ApiProductPriceRow,
  PriceType,
  TimeBucketType,
} from './analytics-types';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://databarn.beefy.finance/api',
    });
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    try {
      const res = await this.api.get('/v1/beefy/timeline', { params: { address } });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response.status === 404) {
          return [];
        }
      }
      throw err;
    }
  }

  public async getVaultPrices(
    productKey: string,
    priceType: PriceType,
    timeBucket: TimeBucketType
  ): Promise<AnalyticsPriceResponse> {
    const res = await this.api.get('/v1/price', {
      params: { product_key: productKey, price_type: priceType, time_bucket: timeBucket },
    });

    // [datetime, open, high, low, close]
    const datetimeIdx = 0;
    const openIdx = 1;

    return res.data.map(
      (row): ApiProductPriceRow => ({
        date: new Date(row[datetimeIdx]),
        value: new BigNumber(row[openIdx]),
      })
    );
  }
}
