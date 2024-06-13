import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types';
import type { VaultEntity } from '../entities/vault';
import type { TokenEntity } from '../entities/token';
import type { SerializedError } from '@reduxjs/toolkit';

type LoadingStatus = 'idle' | 'pending' | 'rejected' | 'fulfilled';
export type ChartStat = 'apy' | 'tvl' | 'price' | 'clm';

type WithStatus<T extends object> = {
  status: LoadingStatus;
  error?: SerializedError;
} & Partial<T>;

export type RangeState = WithStatus<{
  ranges: ApiRanges;
}>;

export type TimeBucketState = WithStatus<{
  data: ApiChartData | ApiCowcentratedChartData;
}>;

export type TimeBucketsState = {
  availableTimebuckets: Record<ApiTimeBucket, boolean>;
  loadedTimebuckets: Record<ApiTimeBucket, boolean>;
  byTimebucket: {
    [K in ApiTimeBucket]?: TimeBucketState;
  };
};

type HistoricalByVaultIdState<T> = {
  byVaultId: {
    [vaultId: VaultEntity['id']]: T;
  };
};

type HistoricalByOracleIdState<T> = {
  byOracleId: {
    [oracleId: TokenEntity['oracleId']]: T;
  };
};

type TimeBucketByVaultIdState = HistoricalByVaultIdState<TimeBucketsState>;
type TimeBucketByOracleIdState = HistoricalByOracleIdState<TimeBucketsState>;

export interface HistoricalState {
  ranges: HistoricalByVaultIdState<RangeState>;
  /** prices by token oracle id */
  prices: TimeBucketByOracleIdState;
  /** apys by vault id */
  apys: TimeBucketByVaultIdState;
  /** tvl by vault id */
  tvls: TimeBucketByVaultIdState;
  /** clm position/range by vault id */
  clm: TimeBucketByVaultIdState;
}

export type HistoricalStateTimeBucketKeys = {
  [K in keyof HistoricalState]: HistoricalState[K] extends
    | TimeBucketByVaultIdState
    | TimeBucketByOracleIdState
    ? K
    : never;
}[keyof HistoricalState];
