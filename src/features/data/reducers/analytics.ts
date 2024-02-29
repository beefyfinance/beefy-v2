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
import type { ChainEntity } from '../entities/chain';
import { entries } from '../../../helpers/object';

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
          [vaultId: VaultEntity['id']]: VaultTimelineAnalyticsEntity[];
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
      const boostTxIds = new Set(boostTxs.map(tx => tx.transactionId));
      const vaultIdsWithMerges = new Set<string>();
      const vaultTxsIgnoringBoosts = vaultTxs.filter(tx => {
        if (boostTxIds.has(tx.transactionId)) {
          vaultIdsWithMerges.add(tx.displayName);
          return false;
        }
        return true;
      });

      // Build a map of bridge vaults to their base vaults
      const bridgeVaultIds = selectAllVaultsWithBridgedVersion(state);
      const bridgeToBaseId = bridgeVaultIds.reduce(
        (accum: Partial<Record<ChainEntity['id'], BaseVault>>, vault) => {
          if (vault.bridged) {
            for (const [chainId, address] of entries(vault.bridged)) {
              accum[`beefy:vault:${chainId}:${address.toLowerCase()}`] = {
                vaultId: vault.id,
                chainId: vault.chainId,
                productKey: `beefy:vault:${
                  vault.chainId
                }:${vault.earnContractAddress.toLowerCase()}`,
              };
            }
          }
          return accum;
        },
        {}
      );

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
            const tx = txs[i];
            const prevTx = txs[i - 1];

            tx.shareBalance = prevTx.shareBalance.plus(tx.shareDiff);

            const underlyingPerShare = tx.shareDiff.isZero()
              ? BIG_ZERO
              : tx.underlyingDiff.dividedBy(tx.shareDiff).absoluteValue();
            tx.underlyingBalance = tx.shareBalance.multipliedBy(underlyingPerShare);

            // usd can be null if price was missing
            if (tx.usdDiff) {
              const usdPerShare = tx.shareDiff.isZero()
                ? BIG_ZERO
                : tx.usdDiff.dividedBy(tx.shareDiff).absoluteValue();
              tx.usdBalance = tx.shareBalance.multipliedBy(usdPerShare);
            } else {
              tx.usdBalance = prevTx.usdBalance;
            }
          }
        }
      });

      const addressState = getOrCreateAnalyticsAddressState(sliceState, walletAddress);
      addressState.timeline.byVaultId = byVaultId;
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
