import { createSlice } from '@reduxjs/toolkit';
import {
  type ClmUserHarvestsTimeline,
  fetchClmHarvestsForUserChain,
  fetchClmHarvestsForUserVault,
  fetchClmPendingRewards,
  fetchShareToUnderlying,
  fetchWalletTimeline,
  recalculateClmHarvestsForUserVaultId,
} from '../actions/analytics';
import type { ApiProductPriceRow, TimeBucketType } from '../apis/analytics/analytics-types';
import type { AnyTimelineEntity } from '../entities/analytics';
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
  transactionHash: string;
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
          [vaultId: VaultEntity['id']]: AnyTimelineEntity;
        };
      };
      clmHarvests: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: ClmUserHarvestsTimeline;
        };
      };
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
  clmHarvests: {
    byVaultId: Record<VaultEntity['id'], ClmHarvest[]>;
  };
  clmPendingRewards: {
    byVaultId: Record<VaultEntity['id'], ClmPendingRewards>;
  };
}

const initialState: AnalyticsState = {
  byAddress: {},
  shareToUnderlying: {
    byVaultId: {},
  },
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
      const walletAddress = action.payload.walletAddress.toLowerCase();
      const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
      addressState.timeline.byVaultId = action.payload.timelines;
    });

    builder.addCase(fetchShareToUnderlying.fulfilled, (sliceState, action) => {
      const { data, vaultId, timebucket } = action.payload;
      const bucketState = getOrCreateShareToUnderlyingBucketState(sliceState, vaultId, timebucket);
      bucketState.status = 'fulfilled';
      bucketState.data = data;
    });

    builder.addCase(fetchShareToUnderlying.pending, (sliceState, action) => {
      const { timebucket, vaultId } = action.meta.arg;
      const bucketState = getOrCreateShareToUnderlyingBucketState(sliceState, vaultId, timebucket);
      bucketState.status = 'pending';
    });

    builder.addCase(fetchShareToUnderlying.rejected, (sliceState, action) => {
      const { timebucket, vaultId } = action.meta.arg;
      const bucketState = getOrCreateShareToUnderlyingBucketState(sliceState, vaultId, timebucket);
      bucketState.status = 'rejected';
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
      const { data, vaultIds } = action.payload;
      const { fees1, fees0, totalSupply } = data;

      for (const vaultId of vaultIds) {
        sliceState.clmPendingRewards.byVaultId[vaultId] = {
          fees1,
          fees0,
          totalSupply,
        };
      }
    });

    builder.addCase(recalculateClmHarvestsForUserVaultId.fulfilled, (sliceState, action) => {
      const { vaultId, timeline, walletAddress } = action.payload;
      const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
      addressState.clmHarvests.byVaultId[vaultId] = timeline;
    });
  },
});

function getOrCreateShareToUnderlyingBucketState(
  sliceState: Draft<AnalyticsState>,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType
) {
  let vaultState = sliceState.shareToUnderlying.byVaultId[vaultId];
  if (!vaultState) {
    vaultState = sliceState.shareToUnderlying.byVaultId[vaultId] = { byTimebucket: {} };
  }

  let bucketState = vaultState.byTimebucket[timebucket];
  if (!bucketState) {
    bucketState = vaultState.byTimebucket[timebucket] = { data: [], status: 'idle' };
  }

  return bucketState;
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
  const toAdd: ClmHarvest[] = harvests
    .map(
      (row): ClmHarvest => ({
        timestamp: fromUnixTime(Number(row.timestamp)),
        compoundedAmount0: new BigNumber(row.compoundedAmount0),
        compoundedAmount1: new BigNumber(row.compoundedAmount1),
        token0ToUsd: new BigNumber(row.token0ToUsd),
        token1ToUsd: new BigNumber(row.token1ToUsd),
        totalSupply: new BigNumber(row.totalSupply),
        transactionHash: row.transactionHash,
      })
    )
    .filter(h => h.compoundedAmount0.gt(0) || h.compoundedAmount1.gt(0));

  state.clmHarvests.byVaultId[vaultId] = orderBy(
    uniqBy(
      existing.concat(toAdd),
      h =>
        `${h.transactionHash}-${h.compoundedAmount0.toString(10)}-${h.compoundedAmount1.toString(
          10
        )}`
    ),
    h => h.timestamp.getTime(),
    'asc'
  );
}
