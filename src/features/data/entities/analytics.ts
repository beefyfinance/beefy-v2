import type BigNumber from 'bignumber.js';
import type { DatabarnTimelineEntry } from '../apis/databarn/databarn-types.ts';
import type { Prettify, Rest, SnakeToCamelCase } from '../utils/types-utils.ts';
import type { ChainEntity } from './chain.ts';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types.ts';
import type { NonEmptyArray } from '../utils/array-utils.ts';
import type { VaultGovCowcentrated, VaultStandardCowcentrated } from './vault.ts';
import type { TimelineActionClassic, TimelineActionClm } from '../apis/clm/clm-api-types.ts';

type TimelineConfigDatabarnSnake = {
  [K in keyof DatabarnTimelineEntry as SnakeToCamelCase<K>]: DatabarnTimelineEntry[K];
};

export type UnprocessedTimelineEntryStandard = Prettify<
  Rest<
    Record<
      | 'shareBalance'
      | 'shareDiff'
      | 'shareToUnderlyingPrice'
      | 'underlyingBalance'
      | 'underlyingDiff',
      BigNumber
    > &
      Record<'underlyingToUsdPrice' | 'usdBalance' | 'usdDiff', BigNumber | null> &
      Record<'datetime', Date>,
    TimelineConfigDatabarnSnake
  > & {
    type: 'standard';
    transactionId: string;
  }
>;

export type TimelineEntryStandard = UnprocessedTimelineEntryStandard & {
  vaultId: string;
  timeline: 'current' | 'past';
  source?: {
    productKey: string;
    vaultId: string;
    chain: ChainEntity['id'];
  };
};

type UnprocessedTimelineEntryCowcentratedBasePart = {
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
  actions: TimelineActionClm[];
};

export type UnprocessedTimelineEntryCowcentratedWithoutRewardPoolPart = {
  hasRewardPool: false;
};

export type UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart = {
  hasRewardPool: true;
  /** total balance in all reward pools */
  rewardPoolBalance: BigNumber;
  /** total diff from all reward pools */
  rewardPoolDiff: BigNumber;
  /** details of each reward pool */
  rewardPoolDetails: NonEmptyArray<{
    address: string;
    balance: BigNumber;
    diff: BigNumber;
  }>;
  /** reward details */
  rewardPoolClaimedDetails: {
    address: string;
    rewardToUsd: BigNumber;
    claimedAmount: BigNumber;
  }[];
  /** reward pool from which rewards were claimed */
  claimedRewardPool: string | undefined;
};

export type UnprocessedTimelineEntryCowcentratedWithoutRewardPool =
  UnprocessedTimelineEntryCowcentratedBasePart &
    UnprocessedTimelineEntryCowcentratedWithoutRewardPoolPart;
export type UnprocessedTimelineEntryCowcentratedWithRewardPools =
  UnprocessedTimelineEntryCowcentratedBasePart &
    UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart;
export type UnprocessedTimelineEntryCowcentratedPool =
  | UnprocessedTimelineEntryCowcentratedWithoutRewardPool
  | UnprocessedTimelineEntryCowcentratedWithRewardPools;

export type TimelineEntryCowcentratedPool = {
  vaultId: VaultGovCowcentrated['id'];
  type: 'cowcentrated-pool';
  timeline: 'current' | 'past';
  transactionId: string;
  datetime: Date;
  productKey: string;
  displayName: string;
  chain: ChainEntity['id'];
  isEol: boolean;
  isDashboardEol: boolean;
  transactionHash: string;

  shareToUsd: BigNumber;
  shareBalance: BigNumber;
  shareDiff: BigNumber;

  underlyingToUsd: BigNumber;
  underlyingBalance: BigNumber;
  underlyingDiff: BigNumber;
  underlyingPerShare: BigNumber;

  token0ToUsd: BigNumber;
  underlying0Balance: BigNumber;
  underlying0Diff: BigNumber;
  underlying0PerUnderlying: BigNumber;

  token1ToUsd: BigNumber;
  underlying1Balance: BigNumber;
  underlying1Diff: BigNumber;
  underlying1PerUnderlying: BigNumber;

  usdBalance: BigNumber;
  usdDiff: BigNumber;
  actions: TimelineActionClm[];
  rewardPoolClaimedDetails: {
    address: string;
    rewardToUsd: BigNumber;
    claimedAmount: BigNumber;
  }[];
};

type UnprocessedTimelineEntryCowcentratedVaultBasePart = {
  type: 'classic';
  transactionId: string;
  datetime: Date;
  productKey: string;
  displayName: string;
  chain: ChainEntity['id'];
  isEol: boolean;
  isDashboardEol: boolean;
  transactionHash: string;
  shareBalance: BigNumber;
  shareDiff: BigNumber;
  shareToUnderlyingPrice: BigNumber;
  vaultAddress: string;
  vaultBalance: BigNumber;
  vaultDiff: BigNumber;
  underlyingAddress: string;
  underlyingToUsdPrice: BigNumber;
  usdBalance: BigNumber;
  usdDiff: BigNumber;
  underlyingBreakdown: Array<{
    token: string;
    underlyingToToken: BigNumber;
    tokenToUsd: BigNumber;
  }>;
  actions: TimelineActionClassic[];
};

export type UnprocessedTimelineEntryCowcentratedVaultWithoutRewardPoolPart = {
  hasRewardPool: false;
};

export type UnprocessedTimelineEntryCowcentratedVaultWithRewardPoolsPart = {
  hasRewardPool: true;
  /** total balance in all reward pools */
  rewardPoolBalance: BigNumber;
  /** total diff from all reward pools */
  rewardPoolDiff: BigNumber;
  /** details of each reward pool */
  rewardPoolDetails: NonEmptyArray<{
    address: string;
    balance: BigNumber;
    diff: BigNumber;
  }>;
};

export type UnprocessedTimelineEntryCowcentratedVaultWithoutRewardPool =
  UnprocessedTimelineEntryCowcentratedVaultBasePart &
    UnprocessedTimelineEntryCowcentratedVaultWithoutRewardPoolPart;
export type UnprocessedTimelineEntryCowcentratedVaultWithRewardPools =
  UnprocessedTimelineEntryCowcentratedVaultBasePart &
    UnprocessedTimelineEntryCowcentratedVaultWithRewardPoolsPart;
export type UnprocessedTimelineEntryClassicVault =
  | UnprocessedTimelineEntryCowcentratedVaultWithoutRewardPool
  | UnprocessedTimelineEntryCowcentratedVaultWithRewardPools;

export type TimelineEntryCowcentratedVault = {
  vaultId: VaultStandardCowcentrated['id'];
  type: 'cowcentrated-vault';
  timeline: 'current' | 'past';
  transactionId: string;
  datetime: Date;
  productKey: string;
  displayName: string;
  chain: ChainEntity['id'];
  isEol: boolean;
  isDashboardEol: boolean;
  transactionHash: string;
  shareToUsd: BigNumber;
  shareBalance: BigNumber;
  shareDiff: BigNumber;

  underlyingToUsd: BigNumber;
  underlyingBalance: BigNumber;
  underlyingDiff: BigNumber;
  underlyingPerShare: BigNumber;

  token0ToUsd: BigNumber;
  underlying0Balance: BigNumber;
  underlying0Diff: BigNumber;
  underlying0PerUnderlying: BigNumber;

  token1ToUsd: BigNumber;
  underlying1Balance: BigNumber;
  underlying1Diff: BigNumber;
  underlying1PerUnderlying: BigNumber;

  usdBalance: BigNumber;
  usdDiff: BigNumber;
  actions: TimelineActionClassic[];
  rewardPoolClaimedDetails: {
    address: string;
    rewardToUsd: BigNumber;
    claimedAmount: BigNumber;
  }[];
};

export type AnyTimelineEntry =
  | TimelineEntryStandard
  | TimelineEntryCowcentratedPool
  | TimelineEntryCowcentratedVault;

export type TimelineEntryToEntity<T extends AnyTimelineEntry> = {
  type: T['type'];
  /** transactions since user last fully withdrew */
  current: T[];
  /** any transactions prior to `current` */
  past: T[];
  /** what buckets the current data transactions cover */
  buckets: ApiTimeBucket[];
};

export type TimelineEntityStandard = TimelineEntryToEntity<TimelineEntryStandard>;

export type TimelineEntityCowcentratedPool = TimelineEntryToEntity<TimelineEntryCowcentratedPool>;

export type TimelineEntityCowcentratedVault = TimelineEntryToEntity<TimelineEntryCowcentratedVault>;

export type AnyTimelineEntity =
  | TimelineEntityStandard
  | TimelineEntityCowcentratedPool
  | TimelineEntityCowcentratedVault;

export function isTimelineEntryStandard(entry: AnyTimelineEntry): entry is TimelineEntryStandard {
  return entry.type === 'standard';
}

export function isTimelineEntryCowcentratedPool(
  entry: AnyTimelineEntry
): entry is TimelineEntryCowcentratedPool {
  return entry.type === 'cowcentrated-pool';
}

export function isTimelineEntryCowcentratedVault(
  entry: AnyTimelineEntry
): entry is TimelineEntryCowcentratedVault {
  return entry.type === 'cowcentrated-vault';
}

export function isTimelineEntityStandard(
  entity: AnyTimelineEntity | undefined
): entity is TimelineEntityStandard {
  return !!entity && entity.type === 'standard';
}

export function isTimelineEntityCowcentratedPool(
  entity: AnyTimelineEntity | undefined
): entity is TimelineEntityCowcentratedPool {
  return !!entity && entity.type === 'cowcentrated-pool';
}

export function isTimelineEntityCowcentratedVault(
  entity: AnyTimelineEntity | undefined
): entity is TimelineEntityCowcentratedVault {
  return !!entity && entity.type === 'cowcentrated-vault';
}

export function isTimelineEntityCowcentrated(
  entity: AnyTimelineEntity | undefined
): entity is TimelineEntityCowcentratedPool | TimelineEntityCowcentratedVault {
  return isTimelineEntityCowcentratedPool(entity) || isTimelineEntityCowcentratedVault(entity);
}
