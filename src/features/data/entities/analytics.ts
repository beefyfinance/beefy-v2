import type BigNumber from 'bignumber.js';
import type {
  CLMTimelineAnalyticsConfig,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, Prettify, SnakeToCamelCase } from '../utils/types-utils';
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

export type VaultTimelineAnalyticsEntityWithoutVaultId = Prettify<
  VTACWithDateTime & {
    type: 'standard';
    transactionId: string;
    source?: {
      productKey: string;
      vaultId: string;
      chain: ChainEntity['id'];
    };
  }
>;

export type VaultTimelineAnalyticsEntity = VaultTimelineAnalyticsEntityWithoutVaultId & {
  vaultId: string;
};

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

export type CLMTimelineAnalyticsEntityWithoutVaultId = Prettify<
  ChangeTypeOfKeys<CLMABigNumber, 'datetime', Date> & {
    type: 'cowcentrated';
    transactionId: string;
  }
>;

export type CLMTimelineAnalyticsEntity = CLMTimelineAnalyticsEntityWithoutVaultId & {
  vaultId: string;
};

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
