import { ChartData, Ranges, TimeBucket } from '../apis/beefy/beefy-data-api-types';
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
  ranges: Ranges;
}>;

export type TimeBucketState = WithStatus<{
  data: ChartData;
}>;

export type TimeBucketsState = {
  availableTimebuckets: Record<TimeBucket, boolean>;
  loadedTimebuckets: Record<TimeBucket, boolean>;
  byTimebucket: {
    [K in TimeBucket]?: TimeBucketState;
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
