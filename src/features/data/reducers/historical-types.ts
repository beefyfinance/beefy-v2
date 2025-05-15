import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { SerializedError } from '@reduxjs/toolkit';

type LoadingStatus = 'idle' | 'pending' | 'rejected' | 'fulfilled';

type WithStatus<T extends object> = {
  status: LoadingStatus;
  error?: SerializedError;
  alreadyFulfilled: boolean;
  lastDispatch: number;
} & Partial<T>;

export type RangeState = WithStatus<{
  ranges: ApiRanges;
}>;

export type AnyChartData = ApiChartData | ApiCowcentratedChartData;

export type TimeBucketState<T extends AnyChartData = AnyChartData> = WithStatus<{
  data: T;
}>;

export type TimeBucketsState<T extends AnyChartData = AnyChartData> = {
  available: Record<ApiTimeBucket, boolean>;
  alreadyFulfilled: Record<ApiTimeBucket, boolean>;
  lastDispatch: Record<ApiTimeBucket, number>;
  hasData: Record<ApiTimeBucket, boolean>;
  byTimeBucket: {
    [K in ApiTimeBucket]?: TimeBucketState<T>;
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

type TimeBucketByVaultIdState<T extends AnyChartData = AnyChartData> = HistoricalByVaultIdState<
  TimeBucketsState<T>
>;
type TimeBucketByOracleIdState<T extends AnyChartData = AnyChartData> = HistoricalByOracleIdState<
  TimeBucketsState<T>
>;

export interface HistoricalState {
  ranges: HistoricalByVaultIdState<RangeState>;
  /** prices by token oracle id */
  prices: TimeBucketByOracleIdState<ApiChartData>;
  /** apys by vault id */
  apys: TimeBucketByVaultIdState<ApiChartData>;
  /** tvl by vault id */
  tvls: TimeBucketByVaultIdState<ApiChartData>;
  /** clm position/range by vault id */
  clmPositions: TimeBucketByVaultIdState<ApiCowcentratedChartData>;
}

export type ExtractTimeBucketState<TExtract, TState extends HistoricalState = HistoricalState> = {
  [K in keyof TState as TState[K] extends TExtract ? K : never]: TState[K];
};

export type HistoricalTimeBucketByOracleIdState = ExtractTimeBucketState<TimeBucketByOracleIdState>;
export type HistoricalTimeBucketByVaultIdState = ExtractTimeBucketState<TimeBucketByVaultIdState>;

export type HistoricalTimeBucketByOracleIdStateKeys = keyof HistoricalTimeBucketByOracleIdState;
export type HistoricalTimeBucketByVaultIdStateKeys = keyof HistoricalTimeBucketByVaultIdState;
export type HistoricalTimeBucketStateKeys =
  | HistoricalTimeBucketByOracleIdStateKeys
  | HistoricalTimeBucketByVaultIdStateKeys;
