import BigNumber from 'bignumber.js';
import { TimelineAnalyticsConfig } from '../apis/analytics/analytics-types';
import { ChangeTypeOfKeys, SnakeToCamelCase } from '../utils/types-utils';

export type VaultTimelineAnalyticsEntity = ChangeTypeOfKeys<
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
