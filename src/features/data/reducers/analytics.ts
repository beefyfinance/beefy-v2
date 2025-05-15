import { type AsyncThunk, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fromUnixTime } from 'date-fns';
import type { Draft } from 'immer';
import { orderBy, uniqBy } from 'lodash-es';
import type { GraphBucket } from '../../../helpers/graph/types.ts';
import {
  fetchClmHarvestsForVaultsOfUserOnChain,
  fetchClmPendingRewards,
  fetchCowcentratedPriceHistoryClassic,
  fetchCowcentratedPriceHistoryClm,
  fetchShareToUnderlying,
  fetchWalletTimeline,
  recalculateClmPoolHarvestsForUserVaultId,
  recalculateClmVaultHarvestsForUserVaultId,
} from '../actions/analytics.ts';
import {
  getDataApiBucket,
  getDataApiBucketIntervalKey,
} from '../apis/beefy/beefy-data-api-helpers.ts';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types.ts';
import type { ApiClassicHarvestRow, ApiClmHarvestRow } from '../apis/clm/clm-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyMetaThunkConfig } from '../store/types.ts';
import type { AnalyticsState, ClassicHarvest, ClmHarvest } from './analytics-types.ts';

const initialState: AnalyticsState = {
  classicHarvests: {
    byVaultId: {},
  },
  clmHarvests: {
    byVaultId: {},
  },
  clmPendingRewards: {
    byVaultId: {},
  },
  interval: {
    shareToUnderlying: {
      byVaultId: {},
    },
    clmPriceHistory: {
      byVaultId: {},
    },
    classicPriceHistory: {
      byVaultId: {},
    },
  },
  byAddress: {},
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    function addIntervalCases<TKey extends keyof AnalyticsState['interval']>(
      key: TKey,
      thunk: AsyncThunk<
        {
          data: AnalyticsState['interval'][TKey]['byVaultId'][string]['byInterval']['1d']['data'];
          vaultId: VaultEntity['id'];
          timeBucket: GraphBucket;
        },
        {
          vaultId: VaultEntity['id'];
          timeBucket: GraphBucket;
        },
        BeefyMetaThunkConfig<{
          since: number;
        }>
      >
    ) {
      builder
        .addCase(thunk.fulfilled, (sliceState, action) => {
          const { data, vaultId, timeBucket } = action.payload;
          const intervalState = getOrCreateIntervalState(
            sliceState,
            key,
            vaultId,
            getDataApiBucketIntervalKey(timeBucket)
          );
          intervalState.status = 'fulfilled';
          intervalState.data = data;
          if (
            intervalState.fulfilledSince === 0 ||
            action.meta.since < intervalState.fulfilledSince
          ) {
            intervalState.fulfilledSince = action.meta.since;
          }
        })
        .addCase(thunk.pending, (sliceState, action) => {
          const { timeBucket, vaultId } = action.meta.arg;
          const bucket = getDataApiBucket(timeBucket);
          const intervalState = getOrCreateIntervalState(
            sliceState,
            key,
            vaultId,
            bucket.intervalKey
          );
          intervalState.status = 'pending';
          if (
            intervalState.requestedSince === 0 ||
            action.meta.since < intervalState.requestedSince
          ) {
            intervalState.requestedSince = action.meta.since;
          }
        })
        .addCase(thunk.rejected, (sliceState, action) => {
          const { timeBucket, vaultId } = action.meta.arg;
          const intervalState = getOrCreateIntervalState(
            sliceState,
            key,
            vaultId,
            getDataApiBucketIntervalKey(timeBucket)
          );
          intervalState.status = 'rejected';
        });
    }

    addIntervalCases('shareToUnderlying', fetchShareToUnderlying);
    addIntervalCases('clmPriceHistory', fetchCowcentratedPriceHistoryClm);
    addIntervalCases('classicPriceHistory', fetchCowcentratedPriceHistoryClassic);

    builder
      .addCase(fetchWalletTimeline.fulfilled, (sliceState, action) => {
        const walletAddress = action.payload.walletAddress.toLowerCase();
        const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
        addressState.timeline.byVaultId = action.payload.timelines;
      })
      .addCase(fetchClmHarvestsForVaultsOfUserOnChain.fulfilled, (sliceState, action) => {
        for (const { harvests, vaultId, type } of action.payload) {
          if (type === 'clm') {
            addClmHarvestsToState(sliceState, vaultId, harvests);
          } else if (type === 'classic') {
            addClassicHarvestsToState(sliceState, vaultId, harvests);
          }
        }
      })
      .addCase(fetchClmPendingRewards.fulfilled, (sliceState, action) => {
        const { data, vaultIds } = action.payload;
        const { fees1, fees0, totalSupply } = data;

        for (const vaultId of vaultIds) {
          sliceState.clmPendingRewards.byVaultId[vaultId] = {
            fees1,
            fees0,
            totalSupply,
          };
        }
      })
      .addCase(recalculateClmPoolHarvestsForUserVaultId.fulfilled, (sliceState, action) => {
        const { vaultId, timeline, walletAddress } = action.payload;
        const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
        addressState.clmHarvests.byVaultId[vaultId] = timeline;
      })
      .addCase(recalculateClmVaultHarvestsForUserVaultId.fulfilled, (sliceState, action) => {
        const { vaultId, timeline, walletAddress } = action.payload;
        const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
        addressState.clmVaultHarvests.byVaultId[vaultId] = timeline;
      });
  },
});

function getOrCreateIntervalState(
  sliceState: Draft<AnalyticsState>,
  key: keyof AnalyticsState['interval'],
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
) {
  let vaultState = sliceState.interval[key].byVaultId[vaultId];

  if (!vaultState) {
    vaultState = sliceState.interval[key].byVaultId[vaultId] = {
      byInterval: {
        '1h': { data: [], status: 'idle', requestedSince: 0, fulfilledSince: 0 },
        '1d': { data: [], status: 'idle', requestedSince: 0, fulfilledSince: 0 },
      },
    };
  }

  return vaultState.byInterval[intervalKey];
}

function getOrCreateAnalyticsAddressState(
  sliceState: Draft<AnalyticsState>,
  walletAddress: string
) {
  walletAddress = walletAddress.toLowerCase();
  let addressState = sliceState.byAddress[walletAddress];

  if (!addressState) {
    addressState = sliceState.byAddress[walletAddress] = {
      timeline: { byVaultId: {} },
      clmHarvests: { byVaultId: {} },
      clmVaultHarvests: { byVaultId: {} },
    };
  }

  return addressState;
}

function addClmHarvestsToState(
  state: Draft<AnalyticsState>,
  vaultId: VaultEntity['id'],
  harvests: ApiClmHarvestRow[]
) {
  const existing: ClmHarvest[] = (state.clmHarvests.byVaultId[vaultId] as ClmHarvest[]) ?? [];
  const toAdd: ClmHarvest[] = harvests
    .map(
      (row): ClmHarvest => ({
        id: row.id,
        type: 'clm',
        timestamp: fromUnixTime(Number(row.timestamp)),
        compoundedAmount0: new BigNumber(row.compoundedAmount0),
        compoundedAmount1: new BigNumber(row.compoundedAmount1),
        token0ToUsd: new BigNumber(row.token0ToUsd),
        token1ToUsd: new BigNumber(row.token1ToUsd),
        totalAmount0: new BigNumber(row.totalAmount0),
        totalAmount1: new BigNumber(row.totalAmount1),
        totalSupply: new BigNumber(row.totalSupply),
      })
    )
    .filter(h => h.compoundedAmount0.gt(0) || h.compoundedAmount1.gt(0));

  state.clmHarvests.byVaultId[vaultId] = orderBy(
    uniqBy(existing.concat(toAdd), h => h.id),
    h => h.timestamp.getTime(),
    'asc'
  );
}

function addClassicHarvestsToState(
  state: Draft<AnalyticsState>,
  vaultId: VaultEntity['id'],
  harvests: ApiClassicHarvestRow[]
) {
  const existing: ClassicHarvest[] =
    (state.classicHarvests.byVaultId[vaultId] as ClassicHarvest[]) ?? [];
  const toAdd: ClassicHarvest[] = harvests
    .map(
      (row): ClassicHarvest => ({
        id: row.id,
        type: 'classic',
        timestamp: fromUnixTime(Number(row.timestamp)),
        compoundedAmount: new BigNumber(row.compoundedAmount),
        underlyingToUsd: new BigNumber(row.underlyingToUsd),
        totalUnderlying: new BigNumber(row.totalUnderlying),
        totalSupply: new BigNumber(row.totalSupply),
      })
    )
    .filter(h => h.compoundedAmount.gt(0));

  state.classicHarvests.byVaultId[vaultId] = orderBy(
    uniqBy(existing.concat(toAdd), h => h.id),
    h => h.timestamp.getTime(),
    'asc'
  );
}
