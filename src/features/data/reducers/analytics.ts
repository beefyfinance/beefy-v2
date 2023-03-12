import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number';
import { fetchAnalyticsVaults } from '../actions/analytics';
import { ApiProductPriceRow } from '../apis/analytics/analytics-types';
import { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import { BoostEntity } from '../entities/boost';
import { VaultEntity } from '../entities/vault';
import { selectAllVaultBoostIds } from '../selectors/boosts';

export interface AnalyticsState {
  timeline: {
    byVaultId: { [vaultId: VaultEntity['id']]: VaultTimelineAnalyticsEntity[] };
    byBoostId: { [boostId: BoostEntity['id']]: VaultTimelineAnalyticsEntity[] };
  };
  shareToUnderlying: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: {
        byTimebucket: {
          [timebucket: string]: {
            status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
            failedTimestamp: number | null;
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
          [timebucket: string]: {
            status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
            failedTimestamp: number | null;
            data: ApiProductPriceRow[];
          };
        };
      };
    };
  };
}

const initialState: AnalyticsState = {
  timeline: {
    byVaultId: {},
    byBoostId: {},
  },
  shareToUnderlying: {
    byVaultId: {},
  },
  underlyingToUsd: {
    byVaultId: {},
  },
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAnalyticsVaults.fulfilled, (sliceState, action) => {
      const { timeline, state } = action.payload;

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

      sliceState.timeline.byBoostId = totals.byBoostId;
      sliceState.timeline.byVaultId = totals.byVaultId;
    });
  },
});
