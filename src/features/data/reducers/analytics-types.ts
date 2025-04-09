import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../entities/vault.ts';
import type {
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
} from '../apis/clm/clm-api-types.ts';
import type { AnyTimelineEntity } from '../entities/analytics.ts';
import type { ClmUserHarvestsTimeline } from '../actions/analytics.ts';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types.ts';
import type { DatabarnProductPriceRow } from '../apis/databarn/databarn-types.ts';

type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface AnalyticsIntervalData<T> {
  status: StatusType;
  requestedSince: number;
  fulfilledSince: number;
  data: T[];
}

interface AnalyticsByInterval<T> {
  byInterval: {
    [K in ApiTimeBucketInterval]: AnalyticsIntervalData<T>;
  };
}

interface AnalyticsByVaultId<T> {
  byVaultId: {
    [vaultId: VaultEntity['id']]: T;
  };
}

export interface ClmHarvest {
  id: string;
  type: 'clm';
  timestamp: Date;
  compoundedAmount0: BigNumber;
  compoundedAmount1: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  totalAmount0: BigNumber;
  totalAmount1: BigNumber;
  totalSupply: BigNumber;
}

export interface ClassicHarvest {
  id: string;
  type: 'classic';
  timestamp: Date;
  compoundedAmount: BigNumber;
  underlyingToUsd: BigNumber;
  totalUnderlying: BigNumber;
  totalSupply: BigNumber;
}

export interface ClmPendingRewards {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
}

export interface AnalyticsState {
  clmHarvests: AnalyticsByVaultId<ClmHarvest[]>;
  classicHarvests: AnalyticsByVaultId<ClassicHarvest[]>;
  clmPendingRewards: AnalyticsByVaultId<ClmPendingRewards>;
  interval: {
    shareToUnderlying: AnalyticsByVaultId<AnalyticsByInterval<DatabarnProductPriceRow>>;
    clmPriceHistory: AnalyticsByVaultId<AnalyticsByInterval<ClmPriceHistoryEntryClm>>;
    classicPriceHistory: AnalyticsByVaultId<AnalyticsByInterval<ClmPriceHistoryEntryClassic>>;
  };
  byAddress: {
    [address: string]: {
      timeline: AnalyticsByVaultId<AnyTimelineEntity>;
      clmHarvests: AnalyticsByVaultId<ClmUserHarvestsTimeline>;
      clmVaultHarvests: AnalyticsByVaultId<ClmUserHarvestsTimeline>;
    };
  };
}
