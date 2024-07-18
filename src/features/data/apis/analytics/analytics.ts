import type { AxiosInstance } from 'axios';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  CLMTimelineAnalyticsConfig,
  CLMVaultTimelineAnalyticsConfig,
  PriceType,
  TimeBucketType,
  TimelineAnalyticsConfig,
} from './analytics-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import { partition } from 'lodash-es';

const INVESTOR_API = import.meta.env.VITE_INVESTOR_URL || 'https://investor-api.beefy.finance';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: INVESTOR_API,
    });
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    try {
      const res = await this.api.get<{
        result: {
          clmTimeline: (CLMTimelineAnalyticsConfig | CLMVaultTimelineAnalyticsConfig)[];
          databarnTimeline: TimelineAnalyticsConfig[];
        };
      }>('/api/v1/timeline', { params: { address } });

      const [clmVaultTimeline, clmTimeline] = partition(
        res.data.result.clmTimeline || [],
        (item): item is CLMVaultTimelineAnalyticsConfig => item.type === 'classic'
      );

      return {
        clmTimeline,
        clmVaultTimeline,
        databarnTimeline: res.data.result.databarnTimeline || [],
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          return {
            clmTimeline: [],
            clmVaultTimeline: [],
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
    address: VaultEntity['contractAddress'],
    chain: ChainEntity['id']
  ): Promise<AnalyticsPriceResponse> {
    const res = await this.api.get('/api/v1/prices', {
      params: { address: address.toLowerCase(), productType, priceType, bucket: timeBucket, chain },
    });

    return res.data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }

  public async getClmPrices(oracleId: string, timebucket: TimeBucketType) {
    const res = await this.api.get('/api/v1/prices', {
      params: { oracle: oracleId, bucket: timebucket },
    });
    return res.data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }
}

//
