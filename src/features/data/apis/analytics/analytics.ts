import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  AnalyticsUserTimelineResponse,
  CommonCLMTimelineAnalyticsConfig,
  PriceType,
  TimeBucketType,
} from './analytics-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import { getErrorStatusFromResponse, handleFetchParams } from '../transact/helpers/fetch';
import { partition } from 'lodash-es';
import { getJson } from '../../../../helpers/http';
import { isFetchResponseError } from '../../../../helpers/http/errors';

export class AnalyticsApi {
  public api: string;

  constructor() {
    this.api = import.meta.env.VITE_INVESTOR_URL || 'https://investor-api.beefy.finance';
  }

  public async getWalletTimeline(address: string): Promise<AnalyticsUserTimelineResponse> {
    try {
      const data = await getJson<{ result: AnalyticsUserTimelineResponse }>({
        url: `${this.api}/api/v1/timeline?${handleFetchParams({ address })}`,
      });

      const [clmVaultTimeline, clmTimeline] = partition(
        data.result.clmTimeline || [],
        (item: CommonCLMTimelineAnalyticsConfig) => item.type === 'classic'
      );

      return {
        clmTimeline,
        clmVaultTimeline,
        databarnTimeline: data.result.databarnTimeline || [],
      };
    } catch (error: unknown) {
      if (isFetchResponseError(error)) {
        const errorStatus = getErrorStatusFromResponse(error.response);
        if (errorStatus === 404) {
          return {
            clmTimeline: [],
            clmVaultTimeline: [],
            databarnTimeline: [],
          };
        }
      }
      throw error;
    }
  }

  public async getVaultPrices(
    productType: 'vault' | 'boost',
    priceType: PriceType,
    timeBucket: TimeBucketType,
    address: VaultEntity['contractAddress'],
    chain: ChainEntity['id']
  ): Promise<AnalyticsPriceResponse> {
    const data = await getJson<{ result: { ts: number; value: number }[] }>({
      url: `${this.api}/api/v1/prices`,
      params: { address: address.toLowerCase(), productType, priceType, bucket: timeBucket, chain },
    });

    return data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }

  public async getClmPrices(
    oracleId: string,
    timebucket: TimeBucketType
  ): Promise<AnalyticsPriceResponse> {
    const data = await getJson<{ result: { ts: number; value: number }[] }>({
      url: `${this.api}/api/v1/prices`,
      params: {
        oracle: oracleId,
        bucket: timebucket,
      },
    });

    return data.result.map((row: { ts: number; value: number }) => {
      return { date: new Date(row.ts * 1000), value: new BigNumber(row.value) };
    });
  }
}
