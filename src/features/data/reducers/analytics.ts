import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number';
import {
  fetchWalletTimeline,
  fetchShareToUnderlying,
  fetchUnderlyingToUsd,
} from '../actions/analytics';
import type { ApiProductPriceRow, TimeBucketType } from '../apis/analytics/analytics-types';
import type { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import type { BoostEntity } from '../entities/boost';
import type { VaultEntity } from '../entities/vault';
import { selectAllVaultBoostIds } from '../selectors/boosts';
import type { Draft } from 'immer';

type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface AnalyticsState {
  byAddress: {
    [address: string]: {
      timeline: {
        byVaultId: { [vaultId: VaultEntity['id']]: VaultTimelineAnalyticsEntity[] };
        byBoostId: { [boostId: BoostEntity['id']]: VaultTimelineAnalyticsEntity[] };
      };
      shareToUnderlying: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: {
            byTimebucket: {
              [K in TimeBucketType]?: {
                status: StatusType;
                data: ApiProductPriceRow[];
              };
            };
          };
        };
      };
      underlyingToUsd: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: {
            byTimebucket: {
              [K in TimeBucketType]?: {
                status: StatusType;
                data: ApiProductPriceRow[];
              };
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
      const { timeline, state } = action.payload;
      const walletAddress = action.payload.walletAddress.toLocaleLowerCase();

      const totals = {
        byBoostId: {},
        byVaultId: {},
      };

      for (const row of timeline) {
        const isBoost = row.productKey.startsWith('beefy:boost');

        const totalsKey = isBoost ? totals.byBoostId : totals.byVaultId;

        const history = totalsKey[row.displayName] || [];

        history.push(row);

        totalsKey[row.displayName] = history;
      }

      for (const vaultId of Object.keys(totals.byVaultId)) {
        const boostIds = selectAllVaultBoostIds(state, vaultId);

        const boostTxHashes = new Set();
        const boostKeys: Set<string> = new Set();
        const boostTransactionsByDate: Record<number, VaultTimelineAnalyticsEntity> = {};

        for (const boostId of boostIds) {
          const boostTimeline: VaultTimelineAnalyticsEntity[] = totals.byBoostId[boostId];
          if (boostTimeline) {
            for (const itemTimeline of boostTimeline) {
              boostKeys.add(itemTimeline.productKey);
              boostTxHashes.add(
                `${itemTimeline.datetime.toString()}-${itemTimeline.shareDiff.abs().toString()}`
              );
              boostTransactionsByDate[itemTimeline.datetime.getTime()] = itemTimeline;
            }
          }
        }

        const vaultTimeline = totals.byVaultId[vaultId];

        const partialBoostBalances: Record<string, BigNumber> = Array.from(boostKeys).reduce(
          (accum, cur) => ({ ...accum, [cur]: BIG_ZERO }),
          {}
        );
        for (const itemTimeline of vaultTimeline) {
          const boostData = boostTransactionsByDate[itemTimeline.datetime.getTime()];
          if (boostData) {
            partialBoostBalances[boostData.productKey] = boostData.shareBalance;
          }

          const txHash = `${itemTimeline.datetime.toString()}-${itemTimeline.shareDiff
            .abs()
            .toString()}`;

          if (boostTxHashes.has(txHash)) {
            itemTimeline.internal = true;
          }

          itemTimeline.shareBalance = itemTimeline.shareBalance.plus(
            Object.values(partialBoostBalances).reduce((tot, cur) => tot.plus(cur), BIG_ZERO)
          );
        }
      }

      sliceState.byAddress[walletAddress] = {
        timeline: { ...totals },
        shareToUnderlying: {
          byVaultId: {},
        },
        underlyingToUsd: {
          byVaultId: {},
        },
      };
    });

    builder.addCase(fetchShareToUnderlying.fulfilled, (sliceState, action) => {
      const { data, vaultId, walletAddress, timebucket } = action.payload;

      setStatus(sliceState, 'shareToUnderlying', vaultId, timebucket, walletAddress, 'fulfilled');
      sliceState.byAddress[walletAddress.toLocaleLowerCase()].shareToUnderlying.byVaultId[
        vaultId
      ].byTimebucket[timebucket].data = data;
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

      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'fulfilled');
      sliceState.byAddress[walletAddress.toLocaleLowerCase()].underlyingToUsd.byVaultId[
        vaultId
      ].byTimebucket[timebucket].data = data;
    });

    builder.addCase(fetchUnderlyingToUsd.pending, (sliceState, action) => {
      const { timebucket, walletAddress, vaultId } = action.meta.arg;
      setStatus(sliceState, 'underlyingToUsd', vaultId, timebucket, walletAddress, 'pending');
    });

    builder.addCase(fetchUnderlyingToUsd.rejected, (sliceState, action) => {
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
  walletAddress = walletAddress.toLocaleLowerCase();

  if (!sliceState.byAddress[walletAddress][part].byVaultId[vaultId]) {
    sliceState.byAddress[walletAddress][part].byVaultId[vaultId] = { byTimebucket: {} };
  }

  if (!sliceState.byAddress[walletAddress][part].byVaultId[vaultId].byTimebucket[timebucket]) {
    sliceState.byAddress[walletAddress][part].byVaultId[vaultId].byTimebucket[timebucket] = {
      data: [],
      status: status,
    };
  } else {
    sliceState.byAddress[walletAddress][part].byVaultId[vaultId].byTimebucket[timebucket].status =
      status;
  }
}
