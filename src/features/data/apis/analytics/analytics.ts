import type { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  PriceType,
  TimeBucketType,
  TimelineConfigClassic,
  TimelineConfigClm,
  TimelineConfigDatabarn,
} from './analytics-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import { partition } from 'lodash-es';
import { getJson } from '../../../../helpers/http';
import { isFetchNotFoundError } from '../../../../helpers/http/errors';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = import.meta.env.VITE_INVESTOR_URL || 'https://investor-api.beefy.finance';
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    try {
      const res = await getJson<{
        result: {
          clmTimeline: (TimelineConfigClm | TimelineConfigClassic)[];
          databarnTimeline: TimelineConfigDatabarn[];
        };
      }>({ url: `${this.api}/api/v1/timeline`, params: { address } });

      const [clmVaultTimeline, clmTimeline] = partition(
        res.result.clmTimeline || [],
        (item): item is TimelineConfigClassic => item.type === 'classic'
      );

      return {
        clmTimeline,
        classicTimeline: clmVaultTimeline,
        databarnTimeline: res.result.databarnTimeline || [],
      };
    } catch (err: unknown) {
      if (isFetchNotFoundError(err)) {
        return {
          clmTimeline: [],
          classicTimeline: [],
          databarnTimeline: [],
        };
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
    const res = await getJson<{ result: Array<{ ts: number; value: number }> }>({
      url: `${this.api}/api/v1/prices`,
      params: { address: address.toLowerCase(), productType, priceType, bucket: timeBucket, chain },
    });

    return res.result.map(row => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }
}
