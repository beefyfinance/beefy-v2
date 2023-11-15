import { createSlice } from '@reduxjs/toolkit';
import {
  fetchShareToUnderlying,
  fetchUnderlyingToUsd,
  fetchWalletTimeline,
} from '../actions/analytics';
import type { ApiProductPriceRow, TimeBucketType } from '../apis/analytics/analytics-types';
import type { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import type { VaultEntity } from '../entities/vault';
import type { Draft } from 'immer';
import { groupBy, partition, sortBy } from 'lodash-es';
import { selectAllVaultsWithBridgedVersion } from '../selectors/vaults';
import { BIG_ZERO } from '../../../helpers/big-number';

type StatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface AnalyticsState {
  byAddress: {
    [address: string]: {
      timeline: {
        byVaultId: {
          [vaultId: VaultEntity['id']]: VaultTimelineAnalyticsEntity[];
        };
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

type BaseVault = {
  productKey: string;
  vaultId: string;
  chainId: string;
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchWalletTimeline.fulfilled, (sliceState, action) => {
      const { timeline, state } = action.payload;
      const walletAddress = action.payload.walletAddress.toLowerCase();

      // Separate out all boost txs
      const [boostTxs, vaultTxs] = partition(timeline, tx =>
        tx.productKey.startsWith('beefy:boost')
      );
      // Grab all the tx hashes from the boost txs, and filter out any vault txs that have the same hash
      const boostTxHashes = new Set(boostTxs.map(tx => tx.transactionHash));
      const vaultIdsWithMerges = new Set<string>();
      const vaultTxsIgnoringBoosts = vaultTxs.filter(tx => {
        if (boostTxHashes.has(tx.transactionHash)) {
          vaultIdsWithMerges.add(tx.displayName);
          return false;
        }
        return true;
      });

      // Build a map of bridge vaults to their base vaults
      const bridgeVaultIds = selectAllVaultsWithBridgedVersion(state);
      const bridgeToBaseId = bridgeVaultIds.reduce((accum: Record<string, BaseVault>, vault) => {
        if (vault.bridged) {
          for (const [chainId, address] of Object.entries(vault.bridged)) {
            accum[`beefy:vault:${chainId}:${address.toLowerCase()}`] = {
              vaultId: vault.id,
              chainId: vault.chainId,
              productKey: `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`,
            };
          }
        }
        return accum;
      }, {});

      // Modify the vault txs to use the base vault product key etc.
      // We have to sort since the timeline is not guaranteed to be in order after merge
      const vaultTxsWithBridgeMerged = sortBy(
        vaultTxsIgnoringBoosts.map((tx): VaultTimelineAnalyticsEntity => {
          const base = bridgeToBaseId[tx.productKey];
          if (base) {
            vaultIdsWithMerges.add(base.vaultId);
            return {
              ...tx,
              productKey: base.productKey,
              displayName: base.vaultId,
              chain: base.chainId,
              source: {
                productKey: tx.productKey,
                displayName: tx.displayName,
                chain: tx.chain,
              },
            };
          }

          return tx;
        }),
        tx => tx.datetime.getTime()
      );

      // Group txs by vault id (display name = vault id)
      const byVaultId = groupBy(vaultTxsWithBridgeMerged, tx => tx.displayName);

      // Recalc balances for vaults we merged (boosts and bridge vaults)
      vaultIdsWithMerges.forEach(vaultId => {
        const txs = byVaultId[vaultId];
        if (txs && txs.length > 1) {
          for (let i = 1; i < txs.length; ++i) {
            txs[i].shareBalance = txs[i - 1].shareBalance.plus(txs[i].shareDiff);

            const underlyingPerShare = txs[i].shareDiff.isZero()
              ? BIG_ZERO
              : txs[i].underlyingDiff.dividedBy(txs[i].shareDiff).absoluteValue();
            txs[i].underlyingBalance = txs[i].shareBalance.multipliedBy(underlyingPerShare);

            // usd can be null if price was missing
            if (txs[i].usdDiff) {
              const usdPerShare = txs[i].shareDiff.isZero()
                ? BIG_ZERO
                : txs[i].usdDiff.dividedBy(txs[i].shareDiff).absoluteValue();
              txs[i].usdBalance = txs[i].shareBalance.multipliedBy(usdPerShare);
            } else {
              txs[i].usdBalance = txs[i - 1].usdBalance;
            }
          }
        }
      });

      sliceState.byAddress[walletAddress] = {
        timeline: { byVaultId },
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
