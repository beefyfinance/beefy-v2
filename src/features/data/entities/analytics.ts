import type BigNumber from 'bignumber.js';
import type {
  CLMTimelineAnalyticsAction,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { ChangeTypeOfKeys, Prettify, SnakeToCamelCase } from '../utils/types-utils';
import type { ChainEntity } from './chain';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { NonEmptyArray } from '../utils/array-utils';

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

type CLMTimelineAnalyticsEntryBase = {
  vaultId: string;
  type: 'cowcentrated';
  transactionId: string;
  datetime: Date;
  productKey: string;
  displayName: string;
  chain: ChainEntity['id'];
  isEol: boolean;
  isDashboardEol: boolean;
  transactionHash: string;
  token0ToUsd: BigNumber;
  underlying0Balance: BigNumber;
  underlying0Diff: BigNumber;
  token1ToUsd: BigNumber;
  underlying1Balance: BigNumber;
  underlying1Diff: BigNumber;
  usdBalance: BigNumber;
  usdDiff: BigNumber;
  shareBalance: BigNumber;
  shareDiff: BigNumber;
  managerBalance: BigNumber;
  managerDiff: BigNumber;
  managerAddress: string;
  actions: CLMTimelineAnalyticsAction[];
};

export type CLMTimelineAnalyticsEntryNoRewardPoolPart = {
  hasRewardPool: false;
};

export type CLMTimelineAnalyticsEntryWithRewardPoolPart = {
  hasRewardPool: true;
  /** address of the reward pool */
  rewardPoolAddress: string;
  /** balance of reward pool */
  rewardPoolBalance: BigNumber;
  /** diff of reward pool balance */
  rewardPoolDiff: BigNumber;
};

export type CLMTimelineAnalyticsEntryWithRewardPoolsPart = {
  hasRewardPool: true;
  /** total balance in all reward pools */
  rewardPoolBalance: BigNumber;
  /** total diff from all reward pools */
  rewardPoolDiff: BigNumber;
  /** details of each reward pool */
  rewardPoolDetails: NonEmptyArray<{ address: string; balance: BigNumber; diff: BigNumber }>;
};

export type CLMTimelineAnalyticsEntryNoRewardPool = CLMTimelineAnalyticsEntryBase &
  CLMTimelineAnalyticsEntryNoRewardPoolPart;
export type CLMTimelineAnalyticsEntryRewardPool = CLMTimelineAnalyticsEntryBase &
  CLMTimelineAnalyticsEntryWithRewardPoolPart;
export type CLMTimelineAnalyticsEntryRewardPools = CLMTimelineAnalyticsEntryBase &
  CLMTimelineAnalyticsEntryWithRewardPoolsPart;

export type CLMTimelineAnalyticsEntry =
  | CLMTimelineAnalyticsEntryNoRewardPool
  | CLMTimelineAnalyticsEntryRewardPool;

export type CLMTimelineAnalyticsEntryHandleInput =
  | Omit<CLMTimelineAnalyticsEntryNoRewardPool, 'vaultId'>
  | Omit<CLMTimelineAnalyticsEntryRewardPools, 'vaultId'>;

export type CLMTimelineAnalyticsEntryHandleInputWithVaultId =
  | CLMTimelineAnalyticsEntryNoRewardPool
  | CLMTimelineAnalyticsEntryRewardPools;

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
