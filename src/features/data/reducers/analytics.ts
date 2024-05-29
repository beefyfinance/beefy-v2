import { createSlice } from '@reduxjs/toolkit';
import {
  type ClmHarvestsTimeline,
  fetchClmHarvestsForUserChain,
  fetchClmHarvestsForUserVault,
  fetchClmPendingRewards,
  fetchClmUnderlyingToUsd,
  fetchShareToUnderlying,
  fetchUnderlyingToUsd,
  fetchWalletTimeline,
  recalculateClmHarvestsForUserVaultId,
} from '../actions/analytics';
import type { ApiProductPriceRow, TimeBucketType } from '../apis/analytics/analytics-types';
import type {
  CLMTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntity,
} from '../entities/analytics';
import type { VaultEntity } from '../entities/vault';
import type { Draft } from 'immer';
import { BigNumber } from 'bignumber.js';
import type { ApiClmHarvestPriceRow } from '../apis/clm-api/clm-api-types';
import { fromUnixTime } from 'date-fns';
import { orderBy, uniqBy } from 'lodash-es';

type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface AnalyticsBucketData {
  status: StatusType;
  data: ApiProductPriceRow[];
}

export interface ClmHarvest {
  timestamp: Date;
  compoundedAmount0: BigNumber;
  compoundedAmount1: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  totalSupply: BigNumber;
}

export interface ClmPendingRewards {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
}

export interface AnalyticsState {
  byAddress: {
    [address: string]: {
      timeline: {
        byVaultId: {
          [vaultId: VaultEntity['id']]:
            | VaultTimelineAnalyticsEntity[]
            | CLMTimelineAnalyticsEntity[];
        };
      };
      shareToUnderlying: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: {
            byTimebucket: {
              [K in TimeBucketType]?: AnalyticsBucketData;
            };
          };
        };
      };
      underlyingToUsd: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: {
            byTimebucket: {
              [K in TimeBucketType]?: AnalyticsBucketData;
            };
          };
        };
      };
      clmHarvests: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: ClmHarvestsTimeline;
        };
      };
    };
  };
  clmHarvests: {
    byVaultId: Record<VaultEntity['id'], ClmHarvest[]>;
  };
  clmPendingRewards: {
    byVaultId: Record<VaultEntity['id'], ClmPendingRewards>;
  };
}

const initialState: AnalyticsState = {
  byAddress: {},
  clmHarvests: {
    byVaultId: {},
  },
  clmPendingRewards: {
    byVaultId: {},
  },
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWalletTimeline.fulfilled, (sliceState, action) => {
      const { timeline, cowcentratedTimeline } = action.payload;
      const walletAddress = action.payload.walletAddress.toLowerCase();
      const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
      addressState.timeline.byVaultId = { ...timeline, ...cowcentratedTimeline };
    });

    builder.addCase(fetchShareToUnderlying.fulfilled, (sliceState, action) => {
      const { data, vaultId, walletAddress, timebucket } = action.payload;
      const bucketState = setStatus(
        sliceState,
        'shareToUnderlying',
        vaultId,
        timebucket,
        walletAddress,
        'fulfilled'
      );
      bucketState.data = data;
    });

    builder.addCase(fetchShareToUnderlying.pending, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'shareToUnderlying', vaultId, timebucket, walletAddress, 'pending');
    });

    builder.addCase(fetchShareToUnderlying.rejected, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'shareToUnderlying', vaultId, timebucket, walletAddress, 'rejected');
    });

    builder.addCase(fetchUnderlyingToUsd.fulfilled, (sliceState, action) => {
      const { data, vaultId, walletAddress, timebucket } = action.payload;
      const bucketState = setStatus(
        sliceState,
        'underlyingToUsd',
        vaultId,
        timebucket,
        walletAddress,
        'fulfilled'
      );
      bucketState.data = data;
    });

    builder.addCase(fetchUnderlyingToUsd.pending, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'pending');
    });

    builder.addCase(fetchUnderlyingToUsd.rejected, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'rejected');
    });

    builder.addCase(fetchClmUnderlyingToUsd.fulfilled, (sliceState, action) => {
      const { data, vaultId, walletAddress, timebucket } = action.payload;
      const bucketState = setStatus(
        sliceState,
        'underlyingToUsd',
        vaultId,
        timebucket,
        walletAddress,
        'fulfilled'
      );
      bucketState.data = data;
    });

    builder.addCase(fetchClmUnderlyingToUsd.pending, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'pending');
    });

    builder.addCase(fetchClmUnderlyingToUsd.rejected, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'rejected');
    });

    builder.addCase(fetchClmHarvestsForUserVault.fulfilled, (sliceState, action) => {
      const { harvests, vaultId } = action.payload;
      addClmHarvestsToState(sliceState, vaultId, harvests);
    });

    builder.addCase(fetchClmHarvestsForUserChain.fulfilled, (sliceState, action) => {
      for (const { harvests, vaultId } of action.payload) {
        addClmHarvestsToState(sliceState, vaultId, harvests);
      }
    });

    builder.addCase(fetchClmPendingRewards.fulfilled, (sliceState, action) => {
      const { data, vaultId } = action.payload;
      const { fees1, fees0, totalSupply } = data;

      sliceState.clmPendingRewards.byVaultId[vaultId] = {
        fees1,
        fees0,
        totalSupply,
      };
    });

    builder.addCase(recalculateClmHarvestsForUserVaultId.fulfilled, (sliceState, action) => {
      const { vaultId, timeline, walletAddress } = action.payload;
      const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
      addressState.clmHarvests.byVaultId[vaultId] = timeline;
    });
  },
});

function setStatus(
  sliceState: Draft<AnalyticsState>,
  part: 'shareToUnderlying' | 'underlyingToUsd',
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType,
  walletAddress: string,
  status: StatusType
) {
  const bucketState = getOrCreateAnalyticsAddressPartVaultTimeBucketState(
    sliceState,
    walletAddress,
    part,
    vaultId,
    timebucket
  );
  bucketState.status = status;
  return bucketState;
}

function getOrCreateAnalyticsAddressPartVaultTimeBucketState(
  sliceState: Draft<AnalyticsState>,
  walletAddress: string,
  part: 'shareToUnderlying' | 'underlyingToUsd',
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType
) {
  const partState = getOrCreateAnalyticsAddressPartVaultState(
    sliceState,
    walletAddress,
    part,
    vaultId
  );
  let bucketState = partState.byTimebucket[timebucket];

  if (!bucketState) {
    bucketState = partState.byTimebucket[timebucket] = {
      data: [],
      status: 'idle',
    };
  }

  return bucketState;
}

function getOrCreateAnalyticsAddressPartVaultState(
  sliceState: Draft<AnalyticsState>,
  walletAddress: string,
  part: 'shareToUnderlying' | 'underlyingToUsd',
  vaultId: VaultEntity['id']
) {
  const partState = getOrCreateAnalyticsAddressPartState(sliceState, walletAddress, part);
  let vaultState = partState.byVaultId[vaultId];

  if (!vaultState) {
    vaultState = partState.byVaultId[vaultId] = { byTimebucket: {} };
  }

  return vaultState;
}

function getOrCreateAnalyticsAddressPartState(
  sliceState: Draft<AnalyticsState>,
  walletAddress: string,
  part: 'shareToUnderlying' | 'underlyingToUsd'
) {
  const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
  let partState = addressState[part];

  if (!partState) {
    partState = addressState[part] = { byVaultId: {} };
  }

  return partState;
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
      shareToUnderlying: { byVaultId: {} },
      underlyingToUsd: { byVaultId: {} },
      clmHarvests: { byVaultId: {} },
    };
  }

  return addressState;
}

function addClmHarvestsToState(
  state: Draft<AnalyticsState>,
  vaultId: VaultEntity['id'],
  harvests: ApiClmHarvestPriceRow[]
) {
  const existing: ClmHarvest[] = (state.clmHarvests.byVaultId[vaultId] as ClmHarvest[]) ?? [];
  const toAdd: ClmHarvest[] = harvests.map(
    (row): ClmHarvest => ({
      timestamp: fromUnixTime(Number(row.timestamp)),
      compoundedAmount0: new BigNumber(row.compoundedAmount0),
      compoundedAmount1: new BigNumber(row.compoundedAmount1),
      token0ToUsd: new BigNumber(row.token0ToUsd),
      token1ToUsd: new BigNumber(row.token1ToUsd),
      totalSupply: new BigNumber(row.totalSupply),
    })
  );

  state.clmHarvests.byVaultId[vaultId] = orderBy(
    uniqBy(existing.concat(toAdd), h => h.timestamp.getTime()),
    h => h.timestamp.getTime(),
    'asc'
  );
}
