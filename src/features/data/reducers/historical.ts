import type { ApiRange, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { SerializedError } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
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
        state.prices.byOracleId[oracleId].availableTimebuckets = getBucketsFromRange(ranges.prices);
      })
      .addCase(fetchHistoricalApys.pending, (state, action) => {
        const { vaultId, bucket } = action.meta.arg;
        setTimebucketPending(getOrInitTimeBucketFor('apys', vaultId, state), bucket);
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
        setTimebucketPending(getOrInitTimeBucketFor('tvls', vaultId, state), bucket);
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
        setTimebucketPending(getOrInitTimeBucketFor('prices', oracleId, state), bucket);
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

function getOrInitTimeBucketFor(
  key: 'tvls' | 'prices' | 'apys',
  oracleOrVaultId: string,
  state: Draft<HistoricalState>
): Draft<TimeBucketsState> {
  const subKey = key === 'prices' ? 'byOracleId' : 'byVaultId';
  if (!state[key][subKey][oracleOrVaultId]) {
    state[key][subKey][oracleOrVaultId] = initialTimeBucketsState();
  }
  return state[key][subKey][oracleOrVaultId];
}

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
