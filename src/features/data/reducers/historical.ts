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
import { fromUnixTime, getUnixTime, isAfter, isBefore, sub } from 'date-fns';
import type {
  AnyChartData,
  HistoricalState,
  HistoricalTimeBucketStateKeys,
  TimeBucketsState,
  TimeBucketState,
} from './historical-types';
import type { Draft } from 'immer';
import { isCowcentratedVault } from '../entities/vault';
import {
  allDataApiBuckets,
  getDataApiBucket,
  getDataApiBucketsShorterThan,
} from '../apis/beefy/beefy-data-api-helpers';
import { fromKeys, fromKeysBy } from '../../../helpers/object';

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

const initialTimeBucketsState = <T extends AnyChartData = AnyChartData>(): TimeBucketsState<T> => ({
  available: fromKeys(allDataApiBuckets, false),
  alreadyFulfilled: fromKeys(allDataApiBuckets, false),
  hasData: fromKeys(allDataApiBuckets, false),
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
          alreadyFulfilled: state.ranges.byVaultId[vaultId]?.alreadyFulfilled || false,
        };
      })
      .addCase(fetchHistoricalRanges.rejected, (state, action) => {
        const { vaultId } = action.meta.arg;

        state.ranges.byVaultId[vaultId] = {
          status: 'rejected',
          alreadyFulfilled: state.ranges.byVaultId[vaultId]?.alreadyFulfilled || false,
          error: action.error,
        };
      })
      .addCase(fetchHistoricalRanges.fulfilled, (state, action) => {
        const { vault, oracleId, ranges } = action.payload;

        const vaultId = vault.id;

        state.ranges.byVaultId[vaultId] = {
          status: 'fulfilled',
          alreadyFulfilled: true,
          ranges,
        };

        initAllTimeBuckets(state, oracleId, vaultId);
        state.apys.byVaultId[vaultId].available = getBucketsFromRange(ranges.apys);
        state.tvls.byVaultId[vaultId].available = getBucketsFromRange(ranges.tvls);
        if (isCowcentratedVault(vault)) {
          state.clm.byVaultId[vaultId].available = getBucketsFromRange(ranges.clm);
        }
        state.prices.byOracleId[oracleId].available = getBucketsFromRange(ranges.prices);
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
  key: HistoricalTimeBucketStateKeys,
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
      alreadyFulfilled: false,
    };
  }

  return bucketState;
}

function setTimebucketPending(state: Draft<TimeBucketsState>, bucketKey: ApiTimeBucket) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucketKey);
  bucketState.status = 'pending';
}

function setTimebucketRejected(
  state: Draft<TimeBucketsState>,
  bucketKey: ApiTimeBucket,
  error: SerializedError
) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucketKey);
  bucketState.status = 'rejected';
  bucketState.error = error;
}

function setTimebucketFulfilled(
  state: Draft<TimeBucketsState>,
  bucketKey: ApiTimeBucket,
  data: ApiChartData,
  fillOtherBuckets: boolean = true
) {
  const bucketState = getOrCreateTimeBucketBucket(state, bucketKey);
  bucketState.status = 'fulfilled';
  bucketState.error = undefined;
  bucketState.data = data;
  bucketState.alreadyFulfilled = true;
  state.alreadyFulfilled[bucketKey] = true;
  state.hasData[bucketKey] = data.length > 0;

  // Fill other buckets that have the same interval but a smaller range
  if (fillOtherBuckets && data.length > 0) {
    const now = new Date();
    const shorterBuckets = getDataApiBucketsShorterThan(bucketKey);
    for (const smallerBucket of shorterBuckets) {
      const startDate = getUnixTime(sub(sub(now, smallerBucket.range), smallerBucket.maPeriod));
      setTimebucketFulfilled(
        state,
        smallerBucket.id,
        data.filter(p => p.t >= startDate),
        false
      );
    }
  }
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

function getBucketsFromRange(range: ApiRange | undefined): Record<ApiTimeBucket, boolean> {
  if (!range || range.min === 0) {
    return fromKeys(allDataApiBuckets, false);
  }

  const now = new Date();
  const min = fromUnixTime(range.min);
  const max = fromUnixTime(range.max);
  return fromKeysBy(allDataApiBuckets, bucketKey => {
    const bucket = getDataApiBucket(bucketKey);
    return isBefore(min, sub(now, bucket.available)) && isAfter(max, sub(now, bucket.range));
  });
}
