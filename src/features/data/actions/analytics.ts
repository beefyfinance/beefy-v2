import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getAnalyticsApi, getClmApi } from '../apis/instances';
import {
  type CLMTimelineAnalyticsEntity,
  type CLMTimelineAnalyticsEntityWithoutVaultId,
  isCLMTimelineAnalyticsEntity,
  type VaultTimelineAnalyticsEntity,
  type VaultTimelineAnalyticsEntityWithoutVaultId,
} from '../entities/analytics';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  CLMTimelineAnalyticsConfig,
  TimeBucketType,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import { isCowcentratedVault, type VaultEntity } from '../entities/vault';
import { isFiniteNumber } from '../../../helpers/number';
import {
  selectAllVaultsWithBridgedVersion,
  selectCowcentratedVaultById,
  selectVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../selectors/vaults';
import { selectCowcentratedVaultDepositTokens, selectTokenByAddress } from '../selectors/tokens';
import { groupBy, partition, sortBy } from 'lodash-es';
import type { ChainEntity } from '../entities/chain';
import { entries } from '../../../helpers/object';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectUserDepositedVaultIds } from '../selectors/balance';
import {
  selectClmHarvestsByVaultId,
  selectUserDepositedTimelineByVaultId,
  selectUserFirstDepositDateByVaultId,
} from '../selectors/analytics';
import { keyBy } from 'lodash';
import type {
  ApiClmHarvestPriceRow,
  ClmPendingRewardsResponse,
} from '../apis/clm-api/clm-api-types';
import type { TokenEntity } from '../entities/token';
import { isAfter } from 'date-fns';
import {
  selectDashboardShouldLoadBalanceForChainUser,
  selectIsClmHarvestsForUserChainPending,
  selectIsClmHarvestsForUserPending,
  selectIsWalletTimelineForUserPending,
} from '../selectors/data-loader';
import { selectAllChainIds } from '../selectors/chains';
import { fetchAllBalanceAction } from './balance';
import { PromiseSettledAwaiter } from '../../../helpers/promises';

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
>(
  'analytics/fetchWalletTimeline',
  async ({ walletAddress }, { getState }) => {
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
  },
  {
    condition: ({ walletAddress }, { getState }) => {
      return !selectIsWalletTimelineForUserPending(getState(), walletAddress);
    },
  }
);

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

interface FetchClmHarvestsFulfilledAction {
  harvests: ApiClmHarvestPriceRow[];
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
}

export const fetchClmHarvestsForUserVault = createAsyncThunk<
  FetchClmHarvestsFulfilledAction,
  { vaultId: VaultEntity['id']; walletAddress: string },
  { state: BeefyState }
>('analytics/fetchClmHarvestsForUserVault', async ({ vaultId }, { getState }) => {
  const state = getState();
  const { chainId, earnContractAddress: vaultAddress } = selectCowcentratedVaultById(
    state,
    vaultId
  );
  const api = await getClmApi();
  const harvests = await api.getHarvestsForVault(chainId, vaultAddress);
  return { harvests, vaultId, chainId };
});

/**
 * Dispatches a fetchClmHarvestsForUserChain action for each chain the user has deposited in a CLM vault
 */
export const fetchClmHarvestsForUser = createAsyncThunk<
  void,
  { walletAddress: string },
  { state: BeefyState }
>(
  'analytics/fetchClmHarvestsForUser',
  async ({ walletAddress }, { getState, dispatch }) => {
    if (!walletAddress) {
      console.error('Cannot fetch clm harvests for user without wallet address');
      return;
    }

    const state = getState();
    const chains = selectUserDepositedVaultIds(state, walletAddress)
      .map(vaultId => selectVaultById(state, vaultId))
      .filter(isCowcentratedVault)
      .map(vault => ({
        id: vault.id,
        address: vault.earnContractAddress.toLowerCase(),
        chainId: vault.chainId,
        since: selectUserFirstDepositDateByVaultId(state, vault.id, walletAddress),
      }))
      .filter(
        (
          vault
        ): vault is { id: string; address: string; chainId: ChainEntity['id']; since: Date } =>
          vault.since !== undefined
      )
      .reduce((acc, vault) => {
        acc.add(vault.chainId);
        return acc;
      }, new Set<ChainEntity['id']>());

    if (!chains.size) {
      console.info('User has no clm vault deposits to fetch harvests for');
      return;
    }

    await Promise.allSettled(
      [...chains].map(chainId =>
        dispatch(
          fetchClmHarvestsForUserChain({
            walletAddress,
            chainId,
          })
        )
      )
    );
  },
  {
    condition: ({ walletAddress }, { getState }) => {
      // don't run again if already pending
      return !selectIsClmHarvestsForUserPending(getState(), walletAddress);
    },
  }
);

type FetchClmHarvestsForUserFulfilledAction = FetchClmHarvestsFulfilledAction[];

/**
 * Fetches all harvests for all cowcentrated vaults the user has deposited in on a specific chain
 */
export const fetchClmHarvestsForUserChain = createAsyncThunk<
  FetchClmHarvestsForUserFulfilledAction,
  { walletAddress: string; chainId: ChainEntity['id'] },
  { state: BeefyState }
>(
  'analytics/fetchClmHarvestsForUserChain',
  async ({ walletAddress, chainId }, { getState }) => {
    const api = await getClmApi();
    const state = getState();
    const vaults = selectUserDepositedVaultIds(state, walletAddress)
      .map(vaultId => selectVaultById(state, vaultId))
      .filter(isCowcentratedVault)
      .filter(vault => vault.chainId === chainId)
      .map(vault => ({
        id: vault.id,
        address: vault.earnContractAddress.toLowerCase(),
        chainId: vault.chainId,
        since: selectUserFirstDepositDateByVaultId(state, vault.id, walletAddress),
      }))
      .filter(
        (
          vault
        ): vault is { id: string; address: string; chainId: ChainEntity['id']; since: Date } =>
          vault.since !== undefined
      );

    if (!vaults.length) {
      return [];
    }

    const vaultsByAddress = keyBy(vaults, vault => vault.address);
    const vaultAddresses = Object.keys(vaultsByAddress);
    const earliest = vaults.reduce(
      (acc, vault) => (vault.since < acc ? vault.since : acc),
      vaults[0].since
    );
    const harvests = await api.getHarvestsForVaultsSince(chainId, vaultAddresses, earliest);

    return harvests.map(({ vaultAddress, harvests }) => {
      const vault = vaultsByAddress[vaultAddress];
      return { vaultId: vault.id, chainId: vault.chainId, harvests };
    });
  },
  {
    condition: ({ chainId, walletAddress }, { getState }) => {
      // don't run again if already pending
      return !selectIsClmHarvestsForUserChainPending(getState(), chainId, walletAddress);
    },
  }
);

export type ClmHarvestsTimelineHarvest = {
  timestamp: Date;
  /** price of tokens at this harvest, one entry per ClmHarvestTimeline['tokens'] */
  prices: BigNumber[];
  /** token amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
  amounts: BigNumber[];
  /** usd amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
  amountsUsd: BigNumber[];
  /** usd total for this harvest (sum of all amountsUsd) */
  totalUsd: BigNumber;
  /** cumulative token amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
  cumulativeAmounts: BigNumber[];
  /** cumulative usd amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
  cumulativeAmountsUsd: BigNumber[];
  /** cumulative total usd */
  cumulativeTotalUsd: BigNumber;
};

export type ClmHarvestsTimeline = {
  tokens: TokenEntity[];
  /** one entry per harvest */
  harvests: ClmHarvestsTimelineHarvest[];
  /** total token amounts, one entry per tokens */
  totals: BigNumber[];
  /** total usd amounts, one entry per tokens */
  totalsUsd: BigNumber[];
  /** overall total usd amount */
  totalUsd: BigNumber;
};

export type RecalculateClmHarvestsForUserVaultIdPayload = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
  timeline: ClmHarvestsTimeline;
};

/**
 * Needs: User Timeline, Vault Harvests and User Balances
 */
export const recalculateClmHarvestsForUserVaultId = createAsyncThunk<
  RecalculateClmHarvestsForUserVaultIdPayload,
  { walletAddress: string; vaultId: VaultEntity['id'] },
  { state: BeefyState }
>(
  'analytics/recalculateClmHarvestsForUserVaultId',
  async ({ walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const { token0, token1 } = selectCowcentratedVaultDepositTokens(state, vaultId);
    const timeline = (
      selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress) || []
    ).filter(isCLMTimelineAnalyticsEntity);
    if (!timeline) {
      throw new Error(`No timeline data found for vault ${vaultId}`);
    }
    const harvests = selectClmHarvestsByVaultId(state, vaultId);
    if (!harvests) {
      throw new Error(`No harvest data found for vault ${vaultId}`);
    }

    const result: RecalculateClmHarvestsForUserVaultIdPayload = {
      vaultId,
      walletAddress,
      timeline: {
        tokens: [token0, token1],
        harvests: [],
        totals: [BIG_ZERO, BIG_ZERO],
        totalsUsd: [BIG_ZERO, BIG_ZERO],
        totalUsd: BIG_ZERO,
      },
    };

    const firstDepositIndex = timeline.findLastIndex(tx => tx.shareBalance.isZero()) + 1;
    const firstDeposit = timeline[firstDepositIndex];
    if (!firstDeposit) {
      console.error(`No first deposit found for vault ${vaultId}`);
      return result;
    }

    const harvestsAfterDeposit = harvests.filter(h => isAfter(h.timestamp, firstDeposit.datetime));
    if (harvestsAfterDeposit.length === 0) {
      console.info(`No harvests found after first deposit for vault ${vaultId}`);
      return result;
    }

    const lastTimelineIdx = timeline.length - 1;
    let timelineIdx = firstDepositIndex;
    for (const harvest of harvestsAfterDeposit) {
      let currentDeposit = timeline[timelineIdx];
      if (
        timelineIdx < lastTimelineIdx &&
        isAfter(harvest.timestamp, timeline[timelineIdx + 1].datetime)
      ) {
        currentDeposit = timeline[++timelineIdx];
      }

      const token0share = currentDeposit.shareBalance
        .multipliedBy(harvest.compoundedAmount0)
        .dividedBy(harvest.totalSupply);
      const token1share = currentDeposit.shareBalance
        .multipliedBy(harvest.compoundedAmount1)
        .dividedBy(harvest.totalSupply);

      const amounts = [token0share, token1share];
      const prices = [harvest.token0ToUsd, harvest.token1ToUsd];
      const amountsUsd = amounts.map((a, i) => a.multipliedBy(prices[i]));
      const totalUsd = amountsUsd.reduce((acc, a) => acc.plus(a), BIG_ZERO);
      const previous = result.timeline.harvests[result.timeline.harvests.length - 1];

      result.timeline.harvests.push({
        timestamp: harvest.timestamp,
        prices,
        amounts,
        amountsUsd,
        totalUsd,
        cumulativeAmounts: previous
          ? amounts.map((a, i) => a.plus(previous.cumulativeAmounts[i]))
          : amounts,
        cumulativeAmountsUsd: previous
          ? amountsUsd.map((a, i) => a.plus(previous.cumulativeAmountsUsd[i]))
          : amountsUsd,
        cumulativeTotalUsd: previous ? previous.cumulativeTotalUsd.plus(totalUsd) : totalUsd,
      });
    }

    if (result.timeline.harvests.length > 0) {
      const lastHarvest = result.timeline.harvests[result.timeline.harvests.length - 1];
      result.timeline.totals = lastHarvest.cumulativeAmounts;
      result.timeline.totalsUsd = lastHarvest.cumulativeAmountsUsd;
      result.timeline.totalUsd = lastHarvest.cumulativeTotalUsd;
    }

    return result;
  }
);

interface FetchClmPendingRewardsFulfilledAction {
  data: ClmPendingRewardsResponse;
  vaultId: VaultEntity['earnContractAddress'];
  chainId: ChainEntity['id'];
}

export const fetchClmPendingRewards = createAsyncThunk<
  FetchClmPendingRewardsFulfilledAction,
  { vaultId: VaultEntity['id'] },
  { state: BeefyState }
>('analytics/fetchClmPendingRewards', async ({ vaultId }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);

  const { chainId, earnContractAddress: vaultAddress } = vault;

  const { token0, token1 } = selectCowcentratedVaultDepositTokens(state, vaultId);

  const stratAddr = selectVaultStrategyAddressOrUndefined(state, vaultId);
  const api = await getClmApi();

  const { fees0, fees1, totalSupply } = await api.getClmPendingRewards(
    state,
    chainId,
    stratAddr,
    vaultAddress
  );

  return {
    data: {
      fees0: fees0.shiftedBy(-token0.decimals),
      fees1: fees1.shiftedBy(-token1.decimals),
      totalSupply: totalSupply.shiftedBy(-18),
    },
    chainId,
    vaultId,
  };
});

export const initDashboardByAddress = createAsyncThunk<
  { walletAddress: string },
  { walletAddress: string },
  { state: BeefyState }
>('analytics/initDashboardByAddress', async ({ walletAddress }, { getState, dispatch }) => {
  const state = getState();
  const chains = selectAllChainIds(state);
  const lowerCaseAddress = walletAddress.toLowerCase();
  const awaiter = new PromiseSettledAwaiter();

  for (const chainId of chains) {
    if (selectDashboardShouldLoadBalanceForChainUser(state, chainId, lowerCaseAddress)) {
      awaiter.add(dispatch(fetchAllBalanceAction({ chainId, walletAddress: lowerCaseAddress })));
    }
  }

  await awaiter.wait();

  return { walletAddress: lowerCaseAddress };
});
