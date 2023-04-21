import type { ApiRange, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import { createSlice } from '@reduxjs/toolkit';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  fetchHistoricalApys,
  fetchHistoricalPrices,
  fetchHistoricalRanges,
  fetchHistoricalTvls,
} from '../actions/historical';
import { fromUnixTime, isAfter, isBefore, sub } from 'date-fns';
import type { HistoricalState, TimeBucketsState, TimeBucketState } from './historical-types';
import type { Draft } from 'immer';
import { mapValues } from 'lodash-es';
import { TIME_BUCKETS } from '../../vault/components/HistoricGraph/utils';

const initialState: HistoricalState = {
  ranges: {
    byVaultId: {},
  },
  prices: {
    byOracleId: {},
  },
  apys: {
    byVaultId: {},
  },
  tvls: {
    byVaultId: {},
  },
};

export const historicalSlice = createSlice({
  name: 'historical',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHistoricalRanges.pending, (state, action) => {
        const { vaultId } = action.meta.arg;

        state.ranges.byVaultId[vaultId] = {
          status: 'pending',
        };
      })
      .addCase(fetchHistoricalRanges.rejected, (state, action) => {
        const { vaultId } = action.meta.arg;

        state.ranges.byVaultId[vaultId] = {
          status: 'rejected',
          error: action.error,
        };
      })
      .addCase(fetchHistoricalRanges.fulfilled, (state, action) => {
        const { vaultId, oracleId, ranges } = action.payload;

        state.ranges.byVaultId[vaultId] = {
          status: 'fulfilled',
          ranges,
        };

        initTimeBuckets(state, oracleId, vaultId);
        state.apys.byVaultId[vaultId].availableTimebuckets = getBucketsFromRange(ranges.apys);
        state.tvls.byVaultId[vaultId].availableTimebuckets = getBucketsFromRange(ranges.tvls);
        state.prices.byOracleId[oracleId].availableTimebuckets = getBucketsFromRange(ranges.prices);
      })
      .addCase(fetchHistoricalApys.pending, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketPending(state.apys.byVaultId[vaultId], bucket);
      })
      .addCase(fetchHistoricalApys.rejected, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketRejected(state.apys.byVaultId[vaultId], bucket, action.error);
      })
      .addCase(fetchHistoricalApys.fulfilled, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketFulfilled(state.apys.byVaultId[vaultId], bucket, action.payload.data);
      })
      .addCase(fetchHistoricalTvls.pending, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketPending(state.tvls.byVaultId[vaultId], bucket);
      })
      .addCase(fetchHistoricalTvls.rejected, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketRejected(state.tvls.byVaultId[vaultId], bucket, action.error);
      })
      .addCase(fetchHistoricalTvls.fulfilled, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketFulfilled(state.tvls.byVaultId[vaultId], bucket, action.payload.data);
      })
      .addCase(fetchHistoricalPrices.pending, (state, action) => {
        const { oracleId, bucket } = action.meta.arg;
        setTimebucketPending(state.prices.byOracleId[oracleId], bucket);
      })
      .addCase(fetchHistoricalPrices.rejected, (state, action) => {
        const { oracleId, bucket } = action.meta.arg;
        setTimebucketRejected(state.prices.byOracleId[oracleId], bucket, action.error);
      })
      .addCase(fetchHistoricalPrices.fulfilled, (state, action) => {
        const { oracleId, bucket } = action.meta.arg;
        setTimebucketFulfilled(state.prices.byOracleId[oracleId], bucket, action.payload.data);
      });
  },
});

function setTimebucketPending(state: Draft<TimeBucketsState>, bucket: ApiTimeBucket) {
  if (bucket in state.byTimebucket) {
    state.byTimebucket[bucket].status = 'pending';
    state.byTimebucket[bucket].error = undefined;
  } else {
    state.byTimebucket[bucket] = {
      status: 'pending',
    };
  }
}

function setTimebucketRejected(
  state: Draft<TimeBucketsState>,
  bucket: ApiTimeBucket,
  error: SerializedError
) {
  state.byTimebucket[bucket].status = 'rejected';
  state.byTimebucket[bucket].error = error;
}

function setTimebucketFulfilled(
  state: Draft<TimeBucketsState>,
  bucket: ApiTimeBucket,
  data: TimeBucketState['data']
) {
  state.byTimebucket[bucket].status = 'fulfilled';
  state.byTimebucket[bucket].error = undefined;
  state.byTimebucket[bucket].data = data;
  state.loadedTimebuckets[bucket] = data.length > 0;
}

function initTimeBuckets(state: Draft<HistoricalState>, oracleId: string, vaultId: string) {
  const unavailableBuckets = mapValues(TIME_BUCKETS, () => false);

  if (!(oracleId in state.prices.byOracleId)) {
    state.prices.byOracleId[oracleId] = {
      availableTimebuckets: { ...unavailableBuckets },
      loadedTimebuckets: { ...unavailableBuckets },
      byTimebucket: {},
    };
  }

  if (!(vaultId in state.apys.byVaultId)) {
    state.apys.byVaultId[vaultId] = {
      availableTimebuckets: { ...unavailableBuckets },
      loadedTimebuckets: { ...unavailableBuckets },
      byTimebucket: {},
    };
  }

  if (!(vaultId in state.tvls.byVaultId)) {
    state.tvls.byVaultId[vaultId] = {
      availableTimebuckets: { ...unavailableBuckets },
      loadedTimebuckets: { ...unavailableBuckets },
      byTimebucket: {},
    };
  }
}

function getBucketsFromRange(range: ApiRange): Record<ApiTimeBucket, boolean> {
  if (range.min === 0) {
    return mapValues(TIME_BUCKETS, () => false);
  }

  const now = new Date();
  const min = fromUnixTime(range.min);
  const max = fromUnixTime(range.max);
  return mapValues(
    TIME_BUCKETS,
    bucket => isBefore(min, sub(now, bucket.available)) && isAfter(max, sub(now, bucket.range))
  );
}
