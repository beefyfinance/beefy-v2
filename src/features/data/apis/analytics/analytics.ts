import type { AxiosInstance } from 'axios';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  PriceType,
  TimeBucketType,
} from './analytics-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://investor-api.beefy.finance/api',
    });
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    try {
      const res = await this.api.get('/v1/timeline', { params: { address } });
      return res.data.result;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          return {
            clmTimeline: [],
            databarnTimeline: [],
          };
        }
      }
      throw err;
    }
  }

  public async getVaultPrices(
    productType: 'vault' | 'boost',
    priceType: PriceType,
    timeBucket: TimeBucketType,
    address: VaultEntity['earnContractAddress'],
    chain: ChainEntity['id']
  ): Promise<AnalyticsPriceResponse> {
    const res = await this.api.get('/v1/prices', {
      params: { address: address.toLowerCase(), productType, priceType, bucket: timeBucket, chain },
    });

    return res.data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }

  public async getClmPrices(oracleId: string, timebucket: TimeBucketType) {
    const res = await this.api.get('/v1/prices', {
      params: { oracle: oracleId, bucket: timebucket },
    });
    return res.data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }
}
//
