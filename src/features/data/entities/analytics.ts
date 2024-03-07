import type BigNumber from 'bignumber.js';
import type { TimelineAnalyticsConfig } from '../apis/analytics/analytics-types';
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
