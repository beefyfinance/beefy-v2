import type BigNumber from 'bignumber.js';
import type { TimelineActionClm, TimelineConfigDatabarn } from '../apis/analytics/analytics-types';
import type { Prettify, Rest, SnakeToCamelCase } from '../utils/types-utils';
import type { ChainEntity } from './chain';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { NonEmptyArray } from '../utils/array-utils';
import type { VaultGovCowcentrated } from './vault';

type TimelineConfigDatabarnSnake = {
  [K in keyof TimelineConfigDatabarn as SnakeToCamelCase<K>]: TimelineConfigDatabarn[K];
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
  rewardPoolDetails: NonEmptyArray<{ address: string; balance: BigNumber; diff: BigNumber }>;
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
  token0ToUsd: BigNumber;
  underlying0Balance: BigNumber;
  underlying0Diff: BigNumber;
  underlying0PerShare: BigNumber;
  token1ToUsd: BigNumber;
  underlying1Balance: BigNumber;
  underlying1Diff: BigNumber;
  underlying1PerShare: BigNumber;
  usdBalance: BigNumber;
  usdDiff: BigNumber;
  usdPerShare: BigNumber;
  shareBalance: BigNumber;
  shareDiff: BigNumber;
  actions: TimelineActionClm[];
};

export type AnyTimelineEntry = TimelineEntryStandard | TimelineEntryCowcentratedPool;

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

export type AnyTimelineEntity = TimelineEntityStandard | TimelineEntityCowcentratedPool;

export function isTimelineEntryStandard(entry: AnyTimelineEntry): entry is TimelineEntryStandard {
  return entry.type === 'standard';
}

export function isTimelineEntryCowcentratedPool(
  entry: AnyTimelineEntry
): entry is TimelineEntryCowcentratedPool {
  return entry.type === 'cowcentrated-pool';
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
