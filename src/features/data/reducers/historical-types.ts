import type { ApiChartData, ApiRanges, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { VaultEntity } from '../entities/vault';
import type { TokenEntity } from '../entities/token';
import type { SerializedError } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';

type LoadingStatus = 'idle' | 'pending' | 'rejected' | 'fulfilled';
export type ChartStat = 'apy' | 'tvl' | 'price' | 'cowcentrated';

type WithStatus<T extends object> = {
  status: LoadingStatus;
  error?: SerializedError;
} & Partial<T>;

export type RangeState = WithStatus<{
  ranges: ApiRanges;
}>;

export type TimeBucketState = WithStatus<{
  data: ApiChartData;
}>;

export type TimeBucketsState = {
  availableTimebuckets: Record<ApiTimeBucket, boolean>;
  loadedTimebuckets: Record<ApiTimeBucket, boolean>;
  byTimebucket: {
    [K in ApiTimeBucket]?: TimeBucketState;
  };
};

export type CowcentratedRanges = {
  currentPrice: BigNumber;
  priceRangeMin: BigNumber;
  priceRangeMax: BigNumber;
};

export interface HistoricalState {
  ranges: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: RangeState;
    };
  };
  prices: {
    byOracleId: {
      [oracleId: TokenEntity['oracleId']]: TimeBucketsState;
    };
  };
  apys: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: TimeBucketsState;
    };
  };
  tvls: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: TimeBucketsState;
    };
  };
  cowcentratedRanges: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: CowcentratedRanges;
    };
  };
}
