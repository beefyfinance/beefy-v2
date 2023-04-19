import type BigNumber from 'bignumber.js';
import type { TimelineAnalyticsConfig } from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, SnakeToCamelCase } from '../utils/types-utils';

export type VaultTimelineAnalyticsWithBigNumber = ChangeTypeOfKeys<
  {
    [K in keyof TimelineAnalyticsConfig as SnakeToCamelCase<K>]: TimelineAnalyticsConfig[K];
  },
  | 'shareBalance'
  | 'shareDiff'
  | 'shareToUnderlyingPrice'
  | 'underlyingBalance'
  | 'underlyingDiff'
  | 'underlyingToUsdPrice'
  | 'usdBalance'
  | 'usdDiff',
  BigNumber
>;

export type VaultTimelineAnalyticsWithDateTime = ChangeTypeOfKeys<
  VaultTimelineAnalyticsWithBigNumber,
  'datetime',
  Date
>;

export type VaultTimelineAnalyticsEntity = VaultTimelineAnalyticsWithDateTime & {
  internal?: boolean;
};
