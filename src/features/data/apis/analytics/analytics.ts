import axios, { AxiosInstance } from 'axios';
import {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  PriceType,
  TimeBucketType,
} from './analytics-types';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://datamart.beefy.com/api',
    });
  }

  public async getUserVaults(address: string): Promise<AnalyticsUserTimelineResponse> {
    const res = await this.api.get('/v0/beefy/timeline', { params: { address } });
    return res.data;
  }

  public async getVaultPrices(
    productKey: string,
    priceType: PriceType,
    timeBucket: TimeBucketType
  ): Promise<AnalyticsPriceResponse> {
    const res = await this.api.get('/v0/price', {
      params: { product_key: productKey, price_type: priceType, time_bucket: timeBucket },
    });

    return res.data;
  }
}
