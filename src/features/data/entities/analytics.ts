import type BigNumber from 'bignumber.js';
import type {
  CLMTimelineAnalyticsConfig,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, SnakeToCamelCase } from '../utils/types-utils';
import type { ChainEntity } from './chain';

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

export type VaultTimelineAnalyticsEntity = VTACWithDateTime & {
  transactionId: string;
  source?: {
    productKey: string;
    displayName: string;
    chain: ChainEntity['id'];
  };
};

type CLMACSnake = {
  [K in keyof CLMTimelineAnalyticsConfig as SnakeToCamelCase<K>]: CLMTimelineAnalyticsConfig[K];
};

type CLMABigNumber = ChangeTypeOfKeys<
  CLMACSnake,
  | 'token0ToUsd'
  | 'token1ToUsd'
  | 'underlying0Balance'
  | 'underlying1Balance'
  | 'underlyingDiff0'
  | 'underlyingDiff1',
  BigNumber
>;

export type CLMTimelineAnalyticsEntity = CLMABigNumber;
