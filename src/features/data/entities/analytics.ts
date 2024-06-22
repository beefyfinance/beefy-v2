import type BigNumber from 'bignumber.js';
import type {
  CLMTimelineAnalyticsConfig,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, Prettify, SnakeToCamelCase } from '../utils/types-utils';
import type { ChainEntity } from './chain';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';

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

export type VaultTimelineAnalyticsEntryWithoutVaultId = Prettify<
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

export type VaultTimelineAnalyticsEntry = VaultTimelineAnalyticsEntryWithoutVaultId & {
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

export type CLMTimelineAnalyticsEntryWithoutVaultId = Prettify<
  ChangeTypeOfKeys<CLMABigNumber, 'datetime', Date> & {
    type: 'cowcentrated';
    transactionId: string;
  }
>;

export type CLMTimelineAnalyticsEntry = CLMTimelineAnalyticsEntryWithoutVaultId & {
  vaultId: string;
};

export type AnyTimelineAnalyticsEntry = VaultTimelineAnalyticsEntry | CLMTimelineAnalyticsEntry;

export type TimelineAnalyticsEntryToEntity<T extends AnyTimelineAnalyticsEntry> = {
  type: T['type'];
  /** transactions since user last fully withdrew */
  current: T[];
  /** any transactions prior to `current` */
  past: T[];
  /** what buckets the current data transactions cover */
  buckets: ApiTimeBucket[];
};

export type VaultTimelineAnalyticsEntity =
  TimelineAnalyticsEntryToEntity<VaultTimelineAnalyticsEntry>;

export type CLMTimelineAnalyticsEntity = TimelineAnalyticsEntryToEntity<CLMTimelineAnalyticsEntry>;

export type AnyTimelineAnalyticsEntity = VaultTimelineAnalyticsEntity | CLMTimelineAnalyticsEntity;

export function isVaultTimelineAnalyticsEntry(
  entity: AnyTimelineAnalyticsEntry
): entity is VaultTimelineAnalyticsEntry {
  return entity.type === 'standard';
}

export function isCLMTimelineAnalyticsEntry(
  entity: AnyTimelineAnalyticsEntry
): entity is CLMTimelineAnalyticsEntry {
  return entity.type === 'cowcentrated';
}

export function isVaultTimelineAnalyticsEntity(
  entity: AnyTimelineAnalyticsEntity | undefined
): entity is VaultTimelineAnalyticsEntity {
  return !!entity && entity.type === 'standard';
}

export function isCLMTimelineAnalyticsEntity(
  entity: AnyTimelineAnalyticsEntity | undefined
): entity is CLMTimelineAnalyticsEntity {
  return !!entity && entity.type === 'cowcentrated';
}
