import type { ApiChartData, ApiRange, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { SerializedError } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchHistoricalApys,
  fetchHistoricalCowcentratedRanges,
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
  clm: {
    byVaultId: {},
  },
};

const initialTimeBucketsState = (): TimeBucketsState => ({
  availableTimebuckets: mapValues(TIME_BUCKETS, () => false),
  loadedTimebuckets: mapValues(TIME_BUCKETS, () => false),
  byTimebucket: {},
});

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

        initAllTimeBuckets(state, oracleId, vaultId);
        state.apys.byVaultId[vaultId].availableTimebuckets = getBucketsFromRange(ranges.apys);
        state.tvls.byVaultId[vaultId].availableTimebuckets = getBucketsFromRange(ranges.tvls);
        state.clm.byVaultId[vaultId].availableTimebuckets = getBucketsFromRange(ranges.clm);
        state.prices.byOracleId[oracleId].availableTimebuckets = getBucketsFromRange(ranges.prices);
      })
      .addCase(fetchHistoricalApys.pending, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketPending(getOrCreateTimeBucketFor('apys', vaultId, state), bucket);
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
        setTimebucketPending(getOrCreateTimeBucketFor('tvls', vaultId, state), bucket);
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
        setTimebucketPending(getOrCreateTimeBucketFor('prices', oracleId, state), bucket);
      })
      .addCase(fetchHistoricalPrices.rejected, (state, action) => {
        const { oracleId, bucket } = action.meta.arg;
        setTimebucketRejected(state.prices.byOracleId[oracleId], bucket, action.error);
      })
      .addCase(fetchHistoricalPrices.fulfilled, (state, action) => {
        const { oracleId, bucket } = action.meta.arg;
        setTimebucketFulfilled(state.prices.byOracleId[oracleId], bucket, action.payload.data);
      })
      .addCase(fetchHistoricalCowcentratedRanges.pending, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketPending(getOrCreateTimeBucketFor('clm', vaultId, state), bucket);
      })
      .addCase(fetchHistoricalCowcentratedRanges.rejected, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketRejected(state.clm.byVaultId[vaultId], bucket, action.error);
      })
      .addCase(fetchHistoricalCowcentratedRanges.fulfilled, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketFulfilled(state.clm.byVaultId[vaultId], bucket, action.payload.data);
      });
  },
});

function getOrCreateTimeBucketFor(
  key: 'tvls' | 'prices' | 'apys' | 'clm',
  oracleOrVaultIdOrVaultAddress: string,
  state: Draft<HistoricalState>
): Draft<TimeBucketsState> {
  const subKey = key === 'prices' ? 'byOracleId' : 'byVaultId';
  if (!state[key][subKey][oracleOrVaultIdOrVaultAddress]) {
    state[key][subKey][oracleOrVaultIdOrVaultAddress] = initialTimeBucketsState();
  }
  return state[key][subKey][oracleOrVaultIdOrVaultAddress];
}

function getOrCreateTimeBucketBucket(
  state: Draft<TimeBucketsState>,
  bucket: ApiTimeBucket
): Draft<TimeBucketState> {
  let bucketState = state.byTimebucket[bucket];

  if (!bucketState) {
    bucketState = state.byTimebucket[bucket] = {
      status: 'idle',
    };
  }

  return bucketState;
}

function setTimebucketPending(state: Draft<TimeBucketsState>, bucket: ApiTimeBucket) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucket);
  bucketState.status = 'pending';
}

function setTimebucketRejected(
  state: Draft<TimeBucketsState>,
  bucket: ApiTimeBucket,
  error: SerializedError
) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucket);
  bucketState.status = 'rejected';
  bucketState.error = error;
}

function setTimebucketFulfilled(
  state: Draft<TimeBucketsState>,
  bucket: ApiTimeBucket,
  data: ApiChartData
) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucket);
  bucketState.status = 'fulfilled';
  bucketState.error = undefined;
  bucketState.data = data;
  state.loadedTimebuckets[bucket] = data.length > 0;
}

function initAllTimeBuckets(state: Draft<HistoricalState>, oracleId: string, vaultId: string) {
  if (!(oracleId in state.prices.byOracleId)) {
    state.prices.byOracleId[oracleId] = initialTimeBucketsState();
  }

  if (!(vaultId in state.apys.byVaultId)) {
    state.apys.byVaultId[vaultId] = initialTimeBucketsState();
  }

  if (!(vaultId in state.tvls.byVaultId)) {
    state.tvls.byVaultId[vaultId] = initialTimeBucketsState();
  }

  if (!(vaultId in state.clm.byVaultId)) {
    state.clm.byVaultId[vaultId] = initialTimeBucketsState();
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
