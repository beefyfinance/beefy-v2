import { ApiChartData, ApiRanges, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import { VaultEntity } from '../entities/vault';
import { TokenEntity } from '../entities/token';
import { SerializedError } from '@reduxjs/toolkit';

type LoadingStatus = 'idle' | 'pending' | 'rejected' | 'fulfilled';
export type ChartStat = 'apy' | 'tvl' | 'price';

type WithStatus<T extends {}> = {
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
}
