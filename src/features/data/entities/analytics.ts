import type BigNumber from 'bignumber.js';
import type {
  CLMTimelineAnalyticsConfig,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, SnakeToCamelCase } from '../utils/types-utils';
import type { ChainEntity } from './chain';
import type { Prettify } from 'viem/chains';

type VTACSnake = {
  [K in keyof TimelineAnalyticsConfig as SnakeToCamelCase<K>]: TimelineAnalyticsConfig[K];
};

type VTACBigNumber = ChangeTypeOfKeys<
  VTACSnake,
  'shareBalance' | 'shareDiff' | 'shareToUnderlyingPrice' | 'underlyingBalance' | 'underlyingDiff',
  BigNumber
>;

type VTACOptionalBigNumber = ChangeTypeOfKeys<
  VTACBigNumber,
  'underlyingToUsdPrice' | 'usdBalance' | 'usdDiff',
  BigNumber | null
>;

type VTACWithDateTime = ChangeTypeOfKeys<VTACOptionalBigNumber, 'datetime', Date>;

export type VaultTimelineAnalyticsEntity = Prettify<
  VTACWithDateTime & {
    type: 'standard';
    transactionId: string;
    source?: {
      productKey: string;
      displayName: string;
      chain: ChainEntity['id'];
    };
  }
>;

type CLMACSnake = {
  [K in keyof CLMTimelineAnalyticsConfig as SnakeToCamelCase<K>]: CLMTimelineAnalyticsConfig[K];
};

type CLMABigNumber = ChangeTypeOfKeys<
  CLMACSnake,
  | 'shareBalance'
  | 'shareDiff'
  | 'token0ToUsd'
  | 'token1ToUsd'
  | 'underlying0Balance'
  | 'underlying1Balance'
  | 'underlying0Diff'
  | 'underlying1Diff'
  | 'usdBalance'
  | 'usdDiff',
  BigNumber
>;

export type CLMTimelineAnalyticsEntity = Prettify<
  ChangeTypeOfKeys<CLMABigNumber, 'datetime', Date> & {
    type: 'cowcentrated';
    transactionId: string;
  }
>;

export function isVaultTimelineAnalyticsEntity(
  entity: VaultTimelineAnalyticsEntity | CLMTimelineAnalyticsEntity
): entity is VaultTimelineAnalyticsEntity {
  return entity.type === 'standard';
}

export function isCLMTimelineAnalyticsEntity(
  entity: VaultTimelineAnalyticsEntity | CLMTimelineAnalyticsEntity
): entity is CLMTimelineAnalyticsEntity {
  return entity.type === 'cowcentrated';
}
