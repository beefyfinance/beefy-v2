import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  CLMVaultTimelineAnalyticsConfig,
  PriceType,
  TimeBucketType,
} from './analytics-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import { handleFetchParams } from '../transact/helpers/fetch';
import { partition } from 'lodash-es';

const INVESTOR_API = import.meta.env.VITE_INVESTOR_URL || 'https://investor-api.beefy.finance';

export class AnalyticsApi {
  public api: string;

  constructor() {
    this.api = INVESTOR_API;
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    const res = await fetch(`${this.api}/api/v1/timeline?${handleFetchParams({ address })}`);

    if (!res.ok) {
      if (res.status === 404) {
        return {
          clmTimeline: [],
          clmVaultTimeline: [],
          databarnTimeline: [],
        };
      }
    }
    const data = await res.json();

    const [clmVaultTimeline, clmTimeline] = partition(
      data.result.clmTimeline || [],
      (item): item is CLMVaultTimelineAnalyticsConfig => item.type === 'classic'
    );

    return {
      clmTimeline,
      clmVaultTimeline,
      databarnTimeline: data.result.databarnTimeline || [],
    };
  }

  public async getVaultPrices(
    productType: 'vault' | 'boost',
    priceType: PriceType,
    timeBucket: TimeBucketType,
    address: VaultEntity['contractAddress'],
    chain: ChainEntity['id']
  ): Promise<AnalyticsPriceResponse> {
    const res = await fetch(
      `${this.api}/api/v1/prices?${handleFetchParams({
        address: address.toLowerCase(),
        productType,
        priceType,
        bucket: timeBucket,
        chain,
      })}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return [] as AnalyticsPriceResponse;
      }
    }

    const data = await res.json();

    return data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }

  public async getClmPrices(oracleId: string, timebucket: TimeBucketType) {
    const res = await fetch(
      `${this.api}/api/v1/prices?${handleFetchParams({
        oracle: oracleId,
        bucket: timebucket,
      })}`
    );
    if (!res.ok) {
      if (res.status === 404) {
        return [] as AnalyticsPriceResponse;
      }
      throw new Error(`HTTP error! stat  us: ${res.status}`);
    }

    const data = await res.json();

    return data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }
}
