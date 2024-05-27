import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import type {
  CLMTimelineAnalyticsEntity,
  CLMTimelineAnalyticsEntityWithoutVaultId,
  VaultTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntityWithoutVaultId,
} from '../entities/analytics';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  CLMTimelineAnalyticsConfig,
  TimeBucketType,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { VaultEntity } from '../entities/vault';
import { isFiniteNumber } from '../../../helpers/number';
import { selectAllVaultsWithBridgedVersion, selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import { groupBy, partition, sortBy } from 'lodash-es';
import type { ChainEntity } from '../entities/chain';
import { entries } from '../../../helpers/object';
import { BIG_ZERO } from '../../../helpers/big-number';

export interface fetchWalletTimelineFulfilled {
  timeline: Record<VaultEntity['id'], VaultTimelineAnalyticsEntity[]>;
  cowcentratedTimeline: Record<VaultEntity['id'], CLMTimelineAnalyticsEntity[]>;
  walletAddress: string;
}

type BaseVault = {
  productKey: string;
  vaultId: string;
  chainId: string;
};

function makeTransactionId(config: TimelineAnalyticsConfig | CLMTimelineAnalyticsConfig): string {
  if (config.transaction_hash) {
    return `${config.chain}:${config.transaction_hash}`;
  }

  // old data doesn't have transaction_hash so we try to make an id that is the same for a given vault/boost tx
  const shareDiff = new BigNumber(config.share_diff);
  return `${config.chain}-${config.datetime}-${shareDiff.absoluteValue().toString(10)}`;
}

function handleStandardTimeline(
  timeline: VaultTimelineAnalyticsEntityWithoutVaultId[],
  state: BeefyState
): Record<VaultEntity['id'], VaultTimelineAnalyticsEntity[]> {
  // Separate out all boost txs
  const [boostTxs, vaultTxs] = partition(timeline, tx => tx.productKey.startsWith('beefy:boost'));

  // Grab all the tx hashes from the boost txs, and filter out any vault txs that have the same hash
  const boostTxIds = new Set(boostTxs.map(tx => tx.transactionId));
  const vaultIdsWithMerges = new Set<string>();
  const vaultTxsIgnoringBoosts = vaultTxs
    .map(tx => ({ ...tx, vaultId: tx.displayName }))
    .filter(tx => {
      if (boostTxIds.has(tx.transactionId)) {
        vaultIdsWithMerges.add(tx.vaultId);
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
            productKey: `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`,
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
          vaultId: base.vaultId,
          chain: base.chainId,
          source: {
            productKey: tx.productKey,
            vaultId: tx.vaultId,
            chain: tx.chain,
          },
        };
      }

      return tx;
    }),
    tx => tx.datetime.getTime()
  );

  // Group txs by vault id
  const byVaultId = groupBy(vaultTxsWithBridgeMerged, tx => tx.vaultId);

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

  return byVaultId;
}

function handleCowcentratedTimeline(
  timeline: CLMTimelineAnalyticsEntityWithoutVaultId[],
  state: BeefyState
): Record<VaultEntity['id'], CLMTimelineAnalyticsEntity[]> {
  const [_, vaultTxs] = partition(timeline, tx => tx.productKey.startsWith('beefy:boost'));

  const vaultTxsWithId = vaultTxs.map(tx => {
    const parts = tx.productKey.split(':');
    if (
      parts.length !== 4 ||
      parts[0] !== 'beefy' ||
      parts[1] !== 'vault' ||
      parts[2] !== tx.chain
    ) {
      return { ...tx, vaultId: tx.displayName };
    }

    const vaultId =
      state.entities.vaults.byChainId[tx.chain]?.cowcentratedVault.byEarnedTokenAddress[parts[3]];
    return { ...tx, vaultId: vaultId || tx.displayName };
  });

  return groupBy(vaultTxsWithId, tx => tx.vaultId);
}

export const fetchWalletTimeline = createAsyncThunk<
  fetchWalletTimelineFulfilled,
  { walletAddress: string },
  { state: BeefyState }
>('analytics/fetchWalletTimeline', async ({ walletAddress }, { getState }) => {
  const api = await getAnalyticsApi();
  const { databarnTimeline, clmTimeline } = await api.getWalletTimeline(walletAddress);
  const state = getState();

  const timeline = handleStandardTimeline(
    databarnTimeline.map((row): VaultTimelineAnalyticsEntityWithoutVaultId => {
      return {
        type: 'standard',
        transactionId: makeTransactionId(row), // old data doesn't have transaction_hash
        datetime: new Date(row.datetime),
        productKey: row.product_key,
        displayName: row.display_name,
        chain: row.chain,
        isEol: row.is_eol,
        isDashboardEol: row.is_dashboard_eol,
        transactionHash: row.transaction_hash,
        shareBalance: new BigNumber(row.share_balance),
        shareDiff: new BigNumber(row.share_diff),
        shareToUnderlyingPrice: new BigNumber(row.share_to_underlying_price),
        underlyingBalance: new BigNumber(row.underlying_balance),
        underlyingDiff: new BigNumber(row.underlying_diff),
        underlyingToUsdPrice: isFiniteNumber(row.underlying_to_usd_price)
          ? new BigNumber(row.underlying_to_usd_price)
          : null,
        usdBalance: isFiniteNumber(row.usd_balance) ? new BigNumber(row.usd_balance) : null,
        usdDiff: isFiniteNumber(row.usd_diff) ? new BigNumber(row.usd_diff) : null,
      };
    }),
    state
  );

  const cowcentratedTimeline = handleCowcentratedTimeline(
    clmTimeline.map((row): CLMTimelineAnalyticsEntityWithoutVaultId => {
      return {
        type: 'cowcentrated',
        transactionId: makeTransactionId(row),
        datetime: new Date(row.datetime),
        productKey: row.product_key,
        displayName: row.display_name,
        chain: row.chain,
        isEol: row.is_eol,
        isDashboardEol: row.is_dashboard_eol,
        transactionHash: row.transaction_hash,
        token0ToUsd: new BigNumber(row.token0_to_usd),
        token1ToUsd: new BigNumber(row.token1_to_usd),
        underlying0Balance: new BigNumber(row.underlying0_balance),
        underlying1Balance: new BigNumber(row.underlying1_balance),
        underlying0Diff: new BigNumber(row.underlying0_diff),
        underlying1Diff: new BigNumber(row.underlying1_diff),
        usdBalance: new BigNumber(row.usd_balance),
        usdDiff: new BigNumber(row.usd_diff),
        shareBalance: new BigNumber(row.share_balance),
        shareDiff: new BigNumber(row.share_diff),
      };
    }),
    state
  );

  return {
    timeline,
    cowcentratedTimeline,
    walletAddress: walletAddress.toLowerCase(),
  };
});

interface DataMartPricesFulfilled {
  data: AnalyticsPriceResponse;
  vaultId: VaultEntity['id'];
  timebucket: TimeBucketType;
  walletAddress: string;
  state: BeefyState;
}

interface DataMartPricesProps {
  timebucket: TimeBucketType;
  walletAddress: string;
  vaultId: VaultEntity['id'];
  productType: 'vault' | 'boost';
}

export const fetchShareToUnderlying = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchShareToUnderlying',
  async ({ productType, walletAddress, timebucket, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(
      productType,
      'share_to_underlying',
      timebucket,
      vault.earnContractAddress,
      vault.chainId
    );
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);

export const fetchUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchUnderlyingToUsd',
  async ({ productType, timebucket, walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(
      productType,
      'underlying_to_usd',
      timebucket,
      vault.earnContractAddress,
      vault.chainId
    );
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);

export const fetchClmUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFulfilled,
  Omit<DataMartPricesProps, 'productType'>,
  { state: BeefyState }
>(
  'analytics/fetchClmUnderlyingToUsd',
  async ({ timebucket, walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const token = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
    const api = await getAnalyticsApi();
    const data = await api.getClmPrices(token.oracleId, timebucket);
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);
