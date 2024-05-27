import { createSlice } from '@reduxjs/toolkit';
import {
  fetchClmUnderlyingToUsd,
  fetchShareToUnderlying,
  fetchUnderlyingToUsd,
  fetchWalletTimeline,
} from '../actions/analytics';
import type { ApiProductPriceRow, TimeBucketType } from '../apis/analytics/analytics-types';
import type {
  CLMTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntity,
} from '../entities/analytics';
import type { VaultEntity } from '../entities/vault';
import type { Draft } from 'immer';

type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface AnalyticsBucketData {
  status: StatusType;
  data: ApiProductPriceRow[];
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
    };
  };
}

const initialState: AnalyticsState = {
  byAddress: {},
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
    };
  }

  return addressState;
}
