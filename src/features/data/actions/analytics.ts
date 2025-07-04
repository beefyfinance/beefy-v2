import BigNumber from 'bignumber.js';
import { fromUnixTime, getUnixTime, isAfter, subHours } from 'date-fns';
import { groupBy, keyBy, mapValues, omitBy, partition, pick, sortBy, values } from 'lodash-es';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number.ts';
import { isLessThanDurationAgoUnix } from '../../../helpers/date.ts';
import { isFiniteNumber } from '../../../helpers/number.ts';
import { entries } from '../../../helpers/object.ts';
import { isFulfilledResult, isRejectedResult } from '../../../helpers/promises.ts';
import {
  getDataApiBucketIntervalKey,
  getDataApiBucketRangeStartDate,
  getDataApiBucketRangeStartDateUnix,
  getDataApiBucketsFromDates,
} from '../apis/beefy/beefy-data-api-helpers.ts';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types.ts';
import { isClmTimelineEntryClassic } from '../apis/clm/clm-api-typeguards.ts';
import type {
  ApiClassicHarvestRow,
  ApiClmHarvestRow,
  ClmPendingRewardsResponse,
  ClmPriceHistoryEntry,
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
  ClmTimelineEntryClassic,
  ClmTimelineEntryClm,
} from '../apis/clm/clm-api-types.ts';
import type {
  DatabarnProductPriceRow,
  DatabarnTimeBucket,
  DatabarnTimelineEntry,
} from '../apis/databarn/databarn-types.ts';
import { getClmApi, getDatabarnApi } from '../apis/instances.ts';
import {
  type AnyTimelineEntity,
  type AnyTimelineEntry,
  isTimelineEntityCowcentratedPool,
  isTimelineEntityCowcentratedVault,
  type TimelineEntryCowcentratedPool,
  type TimelineEntryCowcentratedVault,
  type TimelineEntryStandard,
  type TimelineEntryToEntity,
  type UnprocessedTimelineEntryClassicVault,
  type UnprocessedTimelineEntryCowcentratedPool,
  type UnprocessedTimelineEntryCowcentratedWithoutRewardPoolPart,
  type UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart,
  type UnprocessedTimelineEntryStandard,
} from '../entities/analytics.ts';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import {
  getCowcentratedPool,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isErc4626Vault,
  isStandardVault,
  isVaultRetired,
  type VaultEntity,
} from '../entities/vault.ts';
import {
  selectClassicHarvestsByVaultId,
  selectClmHarvestsByVaultId,
  selectUserDepositedTimelineByVaultId,
  selectUserFirstDepositDateByVaultId,
  selectUserHasCurrentDepositTimelineByVaultId,
} from '../selectors/analytics.ts';
import { selectUserDepositedVaultIds } from '../selectors/balance.ts';
import { selectAllChainIds, selectChainById } from '../selectors/chains.ts';
import {
  selectDashboardShouldLoadBalanceForChainUser,
  selectIsClmHarvestsForUserChainPending,
  selectIsClmHarvestsForUserPending,
  selectIsWalletTimelineForUserPending,
} from '../selectors/dashboard.ts';
import { selectCowcentratedLikeVaultDepositTokens } from '../selectors/tokens.ts';
import {
  selectAllVaultsWithBridgedVersion,
  selectCowcentratedLikeVaultById,
  selectStandardCowcentratedVaultById,
  selectVaultByAddressOrUndefined,
  selectVaultById,
  selectVaultStrategyAddress,
} from '../selectors/vaults.ts';
import type { BeefyMetaThunkConfig, BeefyState } from '../store/types.ts';
import { isDefined, isNonEmptyArray } from '../utils/array-utils.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils.ts';
import { fetchAllBalanceAction } from './balance.ts';
import { fetchUserOffChainRewardsForDepositedVaultsAction } from './user-rewards/user-rewards.ts';
import { featureFlag_simulateMissingTransactions } from '../utils/feature-flags.ts';

export interface FetchWalletTimelineFulfilled {
  timelines: Record<VaultEntity['id'], AnyTimelineEntity>;
  walletAddress: string;
}

type BaseVault = {
  productKey: string;
  vaultId: string;
  chainId: ChainId;
};

function makeTransactionId(
  config: DatabarnTimelineEntry | ClmTimelineEntryClm | ClmTimelineEntryClassic
): string {
  if (config.transaction_hash) {
    return `${config.chain}:${config.transaction_hash}`;
  }

  // old data doesn't have transaction_hash so we try to make an id that is the same for a given vault/boost tx
  const shareDiff = new BigNumber(config.share_diff);
  return `${config.chain}-${config.datetime}-${shareDiff.absoluteValue().toString(10)}`;
}

/**
 * Partitions a timeline into current and past entries based on the last zero share balance entry
 * @param timeline must be in order from oldest to newest
 */
function partitionTimeline<T extends AnyTimelineEntry>(timeline: T[]): TimelineEntryToEntity<T> {
  const currentStartingIndex = timeline.findLastIndex((tx: T) => tx.shareBalance.isZero()) + 1;
  const current = timeline.slice(currentStartingIndex);
  const past = timeline
    .slice(0, currentStartingIndex)
    .map(tx => ({ ...tx, timeline: 'past' as const }));

  let buckets: ApiTimeBucket[] = [];
  if (current.length > 1) {
    const oldest = current[0].datetime;
    const newest = current[current.length - 1].datetime;
    buckets = getDataApiBucketsFromDates(oldest, newest);
  }

  return { type: timeline[0].type, current, past, buckets };
}

function omitEmptyTimelines<T extends AnyTimelineEntry>(
  timelines: Record<VaultEntity['id'], T[]>
): Record<VaultEntity['id'], T[]> {
  return omitBy(timelines, txs => !txs || txs.length === 0);
}

function mergeAndPartitionTimelines(
  ...entriesById: Array<Record<VaultEntity['id'], AnyTimelineEntry[]>>
): Record<VaultEntity['id'], AnyTimelineEntity> {
  return entriesById
    .map(
      byId =>
        mapValues(omitEmptyTimelines(byId), partitionTimeline) as Record<
          VaultEntity['id'],
          AnyTimelineEntity
        >
    )
    .reduce(
      (accum, entitiesById) => {
        return {
          ...accum,
          ...entitiesById,
        };
      },
      {} as Record<VaultEntity['id'], AnyTimelineEntity>
    );
}

function handleDatabarnTimeline(
  timeline: UnprocessedTimelineEntryStandard[],
  state: BeefyState
): Record<VaultEntity['id'], TimelineEntryStandard[]> {
  // Separate out all boost txs
  const [boostTxs, vaultTxs] = partition(timeline, tx => tx.productKey.startsWith('beefy:boost'));

  // Grab all the tx hashes from the boost txs, and filter out any vault txs that have the same hash
  const boostTxIds = new Set(boostTxs.map(tx => tx.transactionId));
  const vaultIdsWithMerges = new Set<string>();
  const vaultTxsIgnoringBoosts = vaultTxs
    .map(tx => ({ ...tx, vaultId: tx.displayName, timeline: 'current' as const }))
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
    (accum: Partial<Record<string, BaseVault>>, vault) => {
      if (isStandardVault(vault) && vault.bridged) {
        for (const [chainId, address] of entries(vault.bridged)) {
          accum[`beefy:vault:${chainId}:${address.toLowerCase()}`] = {
            vaultId: vault.id,
            chainId: vault.chainId,
            productKey: `beefy:vault:${vault.chainId}:${vault.contractAddress.toLowerCase()}`,
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
    vaultTxsIgnoringBoosts.map((tx): TimelineEntryStandard => {
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

        const underlyingPerShare =
          tx.shareDiff.isZero() ?
            BIG_ZERO
          : tx.underlyingDiff.dividedBy(tx.shareDiff).absoluteValue();
        tx.underlyingBalance = tx.shareBalance.multipliedBy(underlyingPerShare);

        // usd can be null if price was missing
        if (tx.usdDiff) {
          const shareToUsd =
            tx.shareDiff.isZero() ? BIG_ZERO : tx.usdDiff.dividedBy(tx.shareDiff).absoluteValue();
          tx.usdBalance = tx.shareBalance.multipliedBy(shareToUsd);
        } else {
          tx.usdBalance = prevTx.usdBalance;
        }
      }
    }
  });

  return applyTransactionFeatureFlags(byVaultId);
}

/** Extract CLM Pool timelines from CLM Timeline */
function handleCowcentratedPoolTimeline(
  timeline: UnprocessedTimelineEntryCowcentratedPool[],
  state: BeefyState
): Record<VaultEntity['id'], TimelineEntryCowcentratedPool[]> {
  const vaultTxs = timeline.filter(tx => tx.productKey.startsWith('beefy:vault:'));

  const txsForPools = sortBy(
    vaultTxs.flatMap(tx => {
      if (tx.hasRewardPool) {
        // share:underlying is 1:1 for pools (not vaults)
        const underlying0PerShare =
          tx.shareBalance.isZero() ?
            tx.shareDiff.isZero() ?
              BIG_ZERO
            : tx.underlying0Diff.dividedBy(tx.shareDiff)
          : tx.underlying0Balance.dividedBy(tx.shareBalance);
        const underlying1PerShare =
          tx.shareBalance.isZero() ?
            tx.shareDiff.isZero() ?
              BIG_ZERO
            : tx.underlying1Diff.dividedBy(tx.shareDiff)
          : tx.underlying1Balance.dividedBy(tx.shareBalance);
        const shareToUsd =
          tx.shareBalance.isZero() ?
            tx.shareDiff.isZero() ?
              BIG_ZERO
            : tx.usdDiff.dividedBy(tx.shareDiff)
          : tx.usdBalance.dividedBy(tx.shareBalance);

        return tx.rewardPoolDetails
          .map((rp): TimelineEntryCowcentratedPool | undefined => {
            // skip txs that do not interact with this pool
            if (rp.diff.isZero() && rp.balance.isZero()) {
              return undefined;
            }

            // skip pools not in the app
            const pool = selectVaultByAddressOrUndefined(state, tx.chain, rp.address);
            if (!pool) {
              return undefined;
            }

            return {
              ...pick(tx, [
                'transactionId',
                'datetime',
                'productKey',
                'chain',
                'transactionHash',
                'token0ToUsd',
                'token1ToUsd',
                'actions',
              ]),
              timeline: 'current' as const,
              type: 'cowcentrated-pool' as const,
              displayName: pool.names.long,
              isEol: isVaultRetired(pool),
              isDashboardEol:
                isVaultRetired(pool) && isLessThanDurationAgoUnix(pool.retiredAt, { days: 30 }),

              shareBalance: rp.balance,
              shareDiff: rp.diff,
              shareToUsd,

              underlyingBalance: rp.balance,
              underlyingDiff: rp.diff,
              underlyingToUsd: shareToUsd,
              underlyingPerShare: BIG_ONE,

              underlying0Balance: rp.balance.multipliedBy(underlying0PerShare),
              underlying0Diff: rp.diff.multipliedBy(underlying0PerShare),
              underlying0PerUnderlying: underlying0PerShare,

              underlying1Balance: rp.balance.multipliedBy(underlying1PerShare),
              underlying1Diff: rp.diff.multipliedBy(underlying1PerShare),
              underlying1PerUnderlying: underlying1PerShare,

              usdBalance: rp.balance.multipliedBy(shareToUsd),
              usdDiff: rp.diff.multipliedBy(shareToUsd),

              vaultId: pool.id,

              rewardPoolClaimedDetails:
                tx.claimedRewardPool?.toLowerCase() === rp.address.toLowerCase() ?
                  tx.rewardPoolClaimedDetails
                : [],
            };
          })
          .filter(isDefined);
      }

      return [];
    }),
    tx => tx.datetime.getTime()
  );

  const byVaultId = groupBy(txsForPools, tx => tx.vaultId);
  return applyTransactionFeatureFlags(byVaultId);
}

function applyTransactionFeatureFlags<T extends Record<string, unknown[]>>(byVaultId: T): T {
  if (featureFlag_simulateMissingTransactions()) {
    return mapValues(byVaultId, txs => (txs.length > 1 ? txs.slice(0, txs.length - 1) : txs)) as T;
  }

  return byVaultId;
}

/** CLM Vaults or ERC4626 Vaults */
function handleClassicVaultTimeline(
  timeline: UnprocessedTimelineEntryClassicVault[],
  state: BeefyState
): Record<VaultEntity['id'], Array<TimelineEntryCowcentratedVault | TimelineEntryStandard>> {
  const vaultTxs = timeline.filter(tx => tx.productKey.startsWith('beefy:vault:'));

  const vaultTxsWithId: Array<TimelineEntryCowcentratedVault | TimelineEntryStandard> = sortBy(
    vaultTxs
      .map(tx => {
        // skip direct deposits/withdraws to/from boosts
        if (
          tx.shareDiff.isZero() &&
          (tx.actions.includes('CLASSIC_REWARD_POOL_STAKE') ||
            tx.actions.includes('CLASSIC_REWARD_POOL_UNSTAKE'))
        ) {
          return undefined;
        }

        const vault = selectVaultByAddressOrUndefined(state, tx.chain, tx.vaultAddress);
        if (!vault) {
          return undefined;
        }

        if (isCowcentratedStandardVault(vault)) {
          if (tx.underlyingBreakdown.length !== 2) {
            console.error(
              `Unexpected underlying breakdown length, got ${tx.underlyingBreakdown.length}, expected 2`
            );
            return undefined;
          }

          return {
            ...pick(tx, [
              'transactionId',
              'datetime',
              'productKey',
              'chain',
              'transactionHash',
              'shareBalance',
              'shareDiff',
              'usdBalance',
              'usdDiff',
              'actions',
            ]),
            vaultId: vault.id,
            timeline: 'current' as const,
            type: 'cowcentrated-vault' as const,
            displayName: vault.names.long,
            isEol: isVaultRetired(vault),
            isDashboardEol:
              isVaultRetired(vault) && isLessThanDurationAgoUnix(vault.retiredAt, { days: 30 }),

            shareToUsd: tx.shareToUnderlyingPrice.multipliedBy(tx.underlyingToUsdPrice),

            underlyingToUsd: tx.underlyingToUsdPrice,
            underlyingBalance: tx.shareBalance.multipliedBy(tx.shareToUnderlyingPrice),
            underlyingDiff: tx.shareDiff.multipliedBy(tx.shareToUnderlyingPrice),
            underlyingPerShare: tx.shareToUnderlyingPrice,

            token0ToUsd: tx.underlyingBreakdown[0].tokenToUsd,
            underlying0Balance: tx.shareBalance
              .multipliedBy(tx.shareToUnderlyingPrice)
              .multipliedBy(tx.underlyingBreakdown[0].underlyingToToken),
            underlying0Diff: tx.shareDiff
              .multipliedBy(tx.shareToUnderlyingPrice)
              .multipliedBy(tx.underlyingBreakdown[0].underlyingToToken),
            underlying0PerUnderlying: tx.underlyingBreakdown[0].underlyingToToken,

            token1ToUsd: tx.underlyingBreakdown[1].tokenToUsd,
            underlying1Balance: tx.shareBalance
              .multipliedBy(tx.shareToUnderlyingPrice)
              .multipliedBy(tx.underlyingBreakdown[1].underlyingToToken),
            underlying1Diff: tx.shareDiff
              .multipliedBy(tx.shareToUnderlyingPrice)
              .multipliedBy(tx.underlyingBreakdown[1].underlyingToToken),
            underlying1PerUnderlying: tx.underlyingBreakdown[1].underlyingToToken,
            //TODO: once we have rewardpool claims for vaults, add them here
            rewardPoolClaimedDetails: [],
          };
        }

        if (isErc4626Vault(vault)) {
          return {
            type: 'standard' as const,
            vaultId: vault.id,
            transactionId: tx.transactionId,
            datetime: tx.datetime,
            productKey: tx.productKey,
            displayName: vault.names.long,
            chain: tx.chain,
            isEol: isVaultRetired(vault),
            isDashboardEol:
              isVaultRetired(vault) && isLessThanDurationAgoUnix(vault.retiredAt, { days: 30 }),
            transactionHash: tx.transactionHash,

            shareBalance: tx.shareBalance,
            shareDiff: tx.shareDiff,
            shareToUnderlyingPrice: tx.shareToUnderlyingPrice,

            underlyingBalance: tx.shareBalance.multipliedBy(tx.shareToUnderlyingPrice),
            underlyingDiff: tx.shareDiff.multipliedBy(tx.shareToUnderlyingPrice),
            underlyingToUsdPrice: tx.underlyingToUsdPrice,

            usdBalance: tx.usdBalance,
            usdDiff: tx.usdDiff,

            timeline: 'current' as const,
          } satisfies TimelineEntryStandard;
        }

        console.error(`Unexpected vault type for classic timeline entry`, vault, tx);
        return undefined;
      })
      .filter(isDefined),
    tx => tx.datetime.getTime()
  );

  const byVaultId = groupBy(vaultTxsWithId, tx => tx.vaultId);
  return applyTransactionFeatureFlags(byVaultId);
}

export const fetchWalletTimeline = createAppAsyncThunk<
  FetchWalletTimelineFulfilled,
  {
    walletAddress: string;
  }
>(
  'analytics/fetchWalletTimeline',
  async ({ walletAddress }, { getState }) => {
    const databarnApi = await getDatabarnApi();
    const clmApi = await getClmApi();

    const [databarnResult, clmResult] = await Promise.allSettled([
      databarnApi.getInvestorTimeline(walletAddress),
      clmApi.getInvestorTimeline(walletAddress),
    ]);

    if (isRejectedResult(databarnResult) && isRejectedResult(clmResult)) {
      throw new Error('Failed to fetch timeline data from databarn and clm api');
    }

    const databarnTimeline = isFulfilledResult(databarnResult) ? databarnResult.value : [];
    const [classicTimeline, clmTimeline] =
      isFulfilledResult(clmResult) ?
        partition(clmResult.value, isClmTimelineEntryClassic)
      : [[], []];
    const state = getState();

    const databarnTimelineProcessed = handleDatabarnTimeline(
      databarnTimeline.map((row): UnprocessedTimelineEntryStandard => {
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
          underlyingToUsdPrice:
            isFiniteNumber(row.underlying_to_usd_price) ?
              new BigNumber(row.underlying_to_usd_price)
            : null,
          usdBalance: isFiniteNumber(row.usd_balance) ? new BigNumber(row.usd_balance) : null,
          usdDiff: isFiniteNumber(row.usd_diff) ? new BigNumber(row.usd_diff) : null,
        };
      }),
      state
    );

    const clmTimelineProcessed = handleCowcentratedPoolTimeline(
      clmTimeline.map((row): UnprocessedTimelineEntryCowcentratedPool => {
        const rewardPoolDetails:
          | UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart['rewardPoolDetails'][0][]
          | undefined =
          isNonEmptyArray(row.reward_pool_details) ?
            row.reward_pool_details.map(rp => ({
              address: rp.reward_pool_address,
              balance: new BigNumber(rp.reward_pool_balance),
              diff: new BigNumber(rp.reward_pool_diff),
            }))
          : undefined;
        const rewardPoolParts:
          | UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart
          | UnprocessedTimelineEntryCowcentratedWithoutRewardPoolPart =
          row.reward_pool_total && row.reward_pool_details && isNonEmptyArray(rewardPoolDetails) ?
            {
              hasRewardPool: true,
              rewardPoolBalance: new BigNumber(row.reward_pool_total.reward_pool_balance || 0),
              rewardPoolDiff: new BigNumber(row.reward_pool_total.reward_pool_diff || 0),
              rewardPoolDetails,
              rewardPoolClaimedDetails: row.reward_pool_claim_details.map(claim => ({
                address: claim.reward_address,
                rewardToUsd: new BigNumber(claim.reward_to_usd),
                claimedAmount: new BigNumber(claim.claimed_amount),
              })),
              claimedRewardPool: row.claimed_reward_pool,
            }
          : { hasRewardPool: false };

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
          underlying0Balance: new BigNumber(row.underlying0_balance),
          underlying0Diff: new BigNumber(row.underlying0_diff),

          token1ToUsd: new BigNumber(row.token1_to_usd),
          underlying1Balance: new BigNumber(row.underlying1_balance),
          underlying1Diff: new BigNumber(row.underlying1_diff),

          usdBalance: new BigNumber(row.usd_balance),
          usdDiff: new BigNumber(row.usd_diff),

          shareBalance: new BigNumber(row.share_balance),
          shareDiff: new BigNumber(row.share_diff),

          managerBalance: new BigNumber(row.manager_balance),
          managerDiff: new BigNumber(row.manager_diff),
          managerAddress: row.manager_address,

          ...rewardPoolParts,

          actions: row.actions,
        };
      }),
      state
    );

    const classicVaultTimelineProcessed = handleClassicVaultTimeline(
      classicTimeline.map((row): UnprocessedTimelineEntryClassicVault => {
        const rewardPoolDetails:
          | UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart['rewardPoolDetails'][0][]
          | undefined =
          isNonEmptyArray(row.reward_pool_details) ?
            row.reward_pool_details.map(rp => ({
              address: rp.reward_pool_address,
              balance: new BigNumber(rp.reward_pool_balance),
              diff: new BigNumber(rp.reward_pool_diff),
            }))
          : undefined;
        const rewardPoolParts:
          | UnprocessedTimelineEntryCowcentratedWithRewardPoolsPart
          | UnprocessedTimelineEntryCowcentratedWithoutRewardPoolPart =
          row.reward_pool_total && row.reward_pool_details && isNonEmptyArray(rewardPoolDetails) ?
            {
              hasRewardPool: true,
              rewardPoolBalance: new BigNumber(row.reward_pool_total.reward_pool_balance || 0),
              rewardPoolDiff: new BigNumber(row.reward_pool_total.reward_pool_diff || 0),
              rewardPoolDetails,
              rewardPoolClaimedDetails: [],
              claimedRewardPool: undefined,
            }
          : { hasRewardPool: false };

        return {
          type: 'classic',
          transactionId: makeTransactionId(row),
          datetime: new Date(row.datetime),
          productKey: row.product_key,
          displayName: row.display_name,
          chain: row.chain,
          isEol: row.is_eol,
          isDashboardEol: row.is_dashboard_eol,
          transactionHash: row.transaction_hash,

          shareBalance: new BigNumber(row.share_balance),
          shareDiff: new BigNumber(row.share_diff),
          shareToUnderlyingPrice: new BigNumber(row.share_to_underlying),

          underlyingAddress: row.underlying_address,
          underlyingToUsdPrice: new BigNumber(row.underlying_to_usd),

          underlyingBreakdown: row.underlying_breakdown.map(ub => ({
            token: ub.token,
            underlyingToToken: new BigNumber(ub.underlying_to_token),
            tokenToUsd: new BigNumber(ub.token_to_usd),
          })),

          usdBalance: new BigNumber(row.usd_balance),
          usdDiff: new BigNumber(row.usd_diff),

          vaultBalance: new BigNumber(row.vault_balance),
          vaultDiff: new BigNumber(row.vault_diff),
          vaultAddress: row.vault_address,

          ...rewardPoolParts,

          actions: row.actions,
        };
      }),
      state
    );

    return {
      timelines: mergeAndPartitionTimelines(
        databarnTimelineProcessed,
        clmTimelineProcessed,
        classicVaultTimelineProcessed
      ),
      walletAddress: walletAddress.toLowerCase(),
    };
  },
  {
    condition: ({ walletAddress }, { getState }) => {
      return !selectIsWalletTimelineForUserPending(getState(), walletAddress);
    },
  }
);

interface DataBarnPricesFulfilled {
  data: DatabarnProductPriceRow[];
  vaultId: VaultEntity['id'];
  timeBucket: DatabarnTimeBucket;
}

interface DataBarnPricesProps {
  timeBucket: DatabarnTimeBucket;
  vaultId: VaultEntity['id'];
}

export const fetchShareToUnderlying = createAppAsyncThunk<
  DataBarnPricesFulfilled,
  DataBarnPricesProps,
  BeefyMetaThunkConfig<{
    since: number;
  }>
>(
  'analytics/fetchShareToUnderlying',
  async ({ timeBucket, vaultId }, { getState, fulfillWithValue }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    let data: DataBarnPricesFulfilled['data'];

    if (isStandardVault(vault)) {
      const api = await getDatabarnApi();
      data = await api.getVaultPrices(
        'vault',
        'share_to_underlying',
        timeBucket,
        vault.contractAddress,
        vault.chainId
      );
    } else if (isErc4626Vault(vault)) {
      // Convert ClmPriceHistoryEntryClassic to DatabarnProductPriceRow
      const api = await getClmApi();
      const since = getDataApiBucketRangeStartDate(timeBucket);
      const classicHistory = await api.getPriceHistoryForVaultSince<ClmPriceHistoryEntryClassic>(
        vault.chainId,
        vault.contractAddress,
        since,
        getDataApiBucketIntervalKey(timeBucket)
      );
      data = classicHistory.map(entry => {
        // convertToAssets(1e18) -> Math.mulDiv(x, y, denominator, 0)
        const x = BIG_ONE.shiftedBy(18);
        const y = new BigNumber(entry.totalUnderlyingAmount).plus(BIG_ONE);
        const denominator = new BigNumber(entry.totalSupply).plus(BIG_ONE);
        const pricePerFullShare = x.multipliedBy(y).dividedToIntegerBy(denominator);

        return {
          date: fromUnixTime(entry.timestamp),
          value: pricePerFullShare.shiftedBy(-18),
        } satisfies DatabarnProductPriceRow;
      });
    } else {
      throw new Error(`Invalid vault type for fetchShareToUnderlying: ${vault.type}`);
    }

    return fulfillWithValue(
      {
        data,
        vaultId,
        timeBucket,
      },
      {
        since: getDataApiBucketRangeStartDateUnix(timeBucket),
      }
    );
  },
  {
    getPendingMeta({ arg: { timeBucket } }) {
      return {
        since: getDataApiBucketRangeStartDateUnix(timeBucket),
      };
    },
  }
);

interface ClmPriceHistoryFulfilled<T extends ClmPriceHistoryEntry> {
  data: T[];
  vaultId: VaultEntity['id'];
  timeBucket: DatabarnTimeBucket;
}

interface ClmPriceHistoryParams {
  timeBucket: DatabarnTimeBucket;
  vaultId: VaultEntity['id'];
}

export const fetchCowcentratedPriceHistoryClassic = createAppAsyncThunk<
  ClmPriceHistoryFulfilled<ClmPriceHistoryEntryClassic>,
  ClmPriceHistoryParams,
  BeefyMetaThunkConfig<{
    since: number;
  }>
>(
  'analytics/fetchCowcentratedPriceHistoryClassic',
  async ({ timeBucket, vaultId }, { getState, fulfillWithValue }) => {
    const state = getState();
    const vault = selectStandardCowcentratedVaultById(state, vaultId);
    const api = await getClmApi();
    const since = getDataApiBucketRangeStartDate(timeBucket);
    const data = await api.getPriceHistoryForVaultSince<ClmPriceHistoryEntryClassic>(
      vault.chainId,
      vault.contractAddress,
      since,
      getDataApiBucketIntervalKey(timeBucket)
    );

    return fulfillWithValue(
      {
        data,
        vaultId,
        timeBucket,
      },
      { since: getUnixTime(since) }
    );
  },
  {
    getPendingMeta({ arg: { timeBucket } }) {
      return {
        since: getDataApiBucketRangeStartDateUnix(timeBucket),
      };
    },
  }
);

export const fetchCowcentratedPriceHistoryClm = createAppAsyncThunk<
  ClmPriceHistoryFulfilled<ClmPriceHistoryEntryClm>,
  ClmPriceHistoryParams,
  BeefyMetaThunkConfig<{
    since: number;
  }>
>(
  'analytics/fetchCowcentratedPriceHistoryClm',
  async ({ timeBucket, vaultId }, { getState, fulfillWithValue }) => {
    const state = getState();
    const vault = selectCowcentratedLikeVaultById(state, vaultId);
    const api = await getClmApi();
    const since = getDataApiBucketRangeStartDate(timeBucket);
    const data = await api.getPriceHistoryForVaultSince<ClmPriceHistoryEntryClm>(
      vault.chainId,
      getCowcentratedAddressFromCowcentratedLikeVault(vault),
      since,
      getDataApiBucketIntervalKey(timeBucket)
    );

    return fulfillWithValue(
      {
        data,
        vaultId,
        timeBucket,
      },
      { since: getUnixTime(since) }
    );
  },
  {
    getPendingMeta({ arg: { timeBucket } }) {
      return {
        since: getDataApiBucketRangeStartDateUnix(timeBucket),
      };
    },
  }
);

/**
 * Dispatches fetchClmHarvestsForVaultsOfUserOnChain for the vault id
 */
export const fetchClmHarvestsForUserVault = createAppAsyncThunk<
  void,
  {
    vaultId: VaultEntity['id'];
    walletAddress: string;
  }
>(
  'analytics/fetchClmHarvestsForUserVault',
  async ({ vaultId, walletAddress }, { getState, dispatch }) => {
    const state = getState();
    const vault = selectCowcentratedLikeVaultById(state, vaultId);
    await dispatch(
      fetchClmHarvestsForVaultsOfUserOnChain({
        walletAddress,
        chainId: vault.chainId,
        vaultIds: [vaultId],
      })
    );
  }
);

/**
 * Dispatches a fetchClmHarvestsForVaultsOfUserOnChain action for each chain the user has deposited in a CLM vault
 */
export const fetchClmHarvestsForUser = createAppAsyncThunk<
  void,
  {
    walletAddress: string;
  }
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
      .filter(isCowcentratedLikeVault)
      .filter(vault => selectUserHasCurrentDepositTimelineByVaultId(state, vault.id, walletAddress))
      .reduce((acc, vault) => {
        const chain = acc.get(vault.chainId);
        if (chain) {
          chain.add(vault.id);
        } else {
          acc.set(vault.chainId, new Set([vault.id]));
        }
        return acc;
      }, new Map<ChainEntity['id'], Set<VaultEntity['id']>>());

    if (!chains.size) {
      console.info('User has no clm vault deposits to fetch harvests for');
      return;
    }

    await Promise.allSettled(
      Array.from(chains, async ([chainId, vaultIds]) =>
        dispatch(
          fetchClmHarvestsForVaultsOfUserOnChain({
            walletAddress,
            chainId,
            vaultIds: Array.from(vaultIds),
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

type FetchClmHarvestsForUserResult =
  | {
      type: 'clm';
      harvests: ApiClmHarvestRow[];
      vaultId: VaultEntity['id'];
      chainId: ChainEntity['id'];
    }
  | {
      type: 'classic';
      harvests: ApiClassicHarvestRow[];
      vaultId: VaultEntity['id'];
      chainId: ChainEntity['id'];
    };

type FetchClmHarvestsForUserFulfilledAction = Array<FetchClmHarvestsForUserResult>;

/**
 * Fetches all harvests for all cowcentrated vaults the user has deposited in on a specific chain
 */
export const fetchClmHarvestsForVaultsOfUserOnChain = createAppAsyncThunk<
  FetchClmHarvestsForUserFulfilledAction,
  {
    walletAddress: string;
    chainId: ChainEntity['id'];
    vaultIds: VaultEntity['id'][];
  }
>(
  'analytics/fetchClmHarvestsForVaultsOfUserOnChain',
  async ({ walletAddress, chainId, vaultIds }, { getState }) => {
    const api = await getClmApi();
    const state = getState();
    const oneHourAgo = subHours(new Date(), 1);
    const requests = vaultIds
      .map(vaultId => selectCowcentratedLikeVaultById(state, vaultId))
      .filter(vault => vault.chainId === chainId)
      .flatMap(vault => {
        const since =
          selectUserFirstDepositDateByVaultId(state, vault.id, walletAddress) || oneHourAgo;
        const items = [
          {
            id: getCowcentratedPool(vault) || vault.cowcentratedIds.clm,
            address: getCowcentratedAddressFromCowcentratedLikeVault(vault),
            chainId: vault.chainId,
            since,
            type: 'clm' as 'clm' | 'classic',
          },
        ];
        if (isCowcentratedStandardVault(vault)) {
          items.push({
            id: vault.id,
            address: vault.contractAddress,
            chainId: vault.chainId,
            since,
            type: 'classic' as 'clm' | 'classic',
          });
        }
        return items;
      });

    if (!requests.length) {
      return [];
    }

    const requestsByAddress = keyBy(requests, req => req.address.toLowerCase());
    const vaultAddresses = Object.keys(requestsByAddress);
    const earliest = requests.reduce(
      (acc, vault) => (vault.since < acc ? vault.since : acc),
      requests[0].since
    );
    const harvests = await api.getHarvestsForVaultsSince(chainId, vaultAddresses, earliest);

    const doneRequests = new Set<string>();
    const result = harvests.map(({ vaultAddress, harvests }): FetchClmHarvestsForUserResult => {
      const req = requestsByAddress[vaultAddress.toLowerCase()];
      doneRequests.add(req.id);
      if (req.type === 'clm') {
        return {
          vaultId: req.id,
          chainId: req.chainId,
          type: req.type,
          harvests: harvests as ApiClmHarvestRow[],
        };
      }
      return {
        vaultId: req.id,
        chainId: req.chainId,
        type: req.type,
        harvests: harvests as ApiClassicHarvestRow[],
      };
    });

    // Add empty harvests for vaults that did not return any
    values(requestsByAddress)
      .filter(req => !doneRequests.has(req.id))
      .forEach(req => {
        result.push({
          vaultId: req.id,
          chainId: req.chainId,
          type: req.type,
          harvests: [],
        });
      });

    return result;
  },
  {
    condition: ({ chainId, walletAddress }, { getState }) => {
      // don't run again if already pending
      return !selectIsClmHarvestsForUserChainPending(getState(), chainId, walletAddress);
    },
  }
);

export type ClmUserHarvestsTimelineHarvest = {
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

export type ClmUserHarvestsTimeline = {
  tokens: TokenEntity[];
  /** one entry per harvest */
  harvests: ClmUserHarvestsTimelineHarvest[];
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
  timeline: ClmUserHarvestsTimeline;
};

/**
 * Needs: User Timeline, Vault Harvests and User Balances
 */
export const recalculateClmPoolHarvestsForUserVaultId = createAppAsyncThunk<
  RecalculateClmHarvestsForUserVaultIdPayload,
  {
    walletAddress: string;
    vaultId: VaultEntity['id'];
  }
>(
  'analytics/recalculateClmPoolHarvestsForUserVaultId',
  async ({ walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const [token0, token1] = selectCowcentratedLikeVaultDepositTokens(state, vaultId);
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

    const timeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
    if (!timeline) {
      console.warn(`No timeline data found for vault ${vaultId}`);
      return result;
    }

    if (!isTimelineEntityCowcentratedPool(timeline)) {
      console.warn(`Non CLM Pool timeline found for vault ${vaultId}`);
      return result;
    }

    const harvests = selectClmHarvestsByVaultId(state, vaultId);
    if (!harvests) {
      console.warn(`No harvest data found for vault ${vaultId}`);
      return result;
    }

    if (timeline.current.length === 0) {
      console.warn(`No current timeline entries found for vault ${vaultId}`);
      return result;
    }

    const firstDeposit = timeline.current[0];
    const harvestsAfterDeposit = harvests.filter(h => isAfter(h.timestamp, firstDeposit.datetime));
    if (harvestsAfterDeposit.length === 0) {
      console.warn(`No harvests found after first deposit for vault ${vaultId}`);
      return result;
    }

    const lastTimelineIdx = timeline.current.length - 1;
    let timelineIdx = 0;
    for (const harvest of harvestsAfterDeposit) {
      let currentDeposit = timeline.current[timelineIdx];
      while (
        timelineIdx < lastTimelineIdx &&
        isAfter(harvest.timestamp, timeline.current[timelineIdx + 1].datetime)
      ) {
        currentDeposit = timeline.current[++timelineIdx];
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
        cumulativeAmounts:
          previous ? amounts.map((a, i) => a.plus(previous.cumulativeAmounts[i])) : amounts,
        cumulativeAmountsUsd:
          previous ?
            amountsUsd.map((a, i) => a.plus(previous.cumulativeAmountsUsd[i]))
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

/**
 * Needs: User Timeline, Vault Harvests and User Balances
 */
export const recalculateClmVaultHarvestsForUserVaultId = createAppAsyncThunk<
  RecalculateClmHarvestsForUserVaultIdPayload,
  { walletAddress: string; vaultId: VaultEntity['id'] }
>(
  'analytics/recalculateClmVaultHarvestsForUserVaultId',
  async ({ walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const [token0, token1] = selectCowcentratedLikeVaultDepositTokens(state, vaultId);
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

    // We make sure we have everything we need from the clm _vault_
    const timeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);

    if (!timeline) {
      console.warn(`No timeline data found for vault ${vaultId}`);
      return result;
    }

    if (!isTimelineEntityCowcentratedVault(timeline)) {
      console.warn(`No CLM Vault timeline found for vault ${vaultId}`);
      return result;
    }

    const harvests = selectClassicHarvestsByVaultId(state, vaultId) ?? [];
    if (!harvests) {
      console.warn(`No classic harvest data found for vault ${vaultId}`);
      return result;
    }

    if (timeline.current.length === 0) {
      console.warn(`No current timeline entries found for vault ${vaultId}`);
      return result;
    }

    // We make sure we have everything we need from the underlying clm
    const clmVault = selectCowcentratedLikeVaultById(state, vaultId);
    const clmPool = getCowcentratedPool(clmVault);

    if (!clmPool) {
      console.warn(`No CLM Pool found for vault ${vaultId}`);
      return result;
    }

    const clmHarvests = selectClmHarvestsByVaultId(state, clmPool) ?? [];

    const firstDeposit = timeline.current[0];
    const vaultHarvestsAfterDeposit = harvests.filter(h =>
      isAfter(h.timestamp, firstDeposit.datetime)
    );
    const clmHarvestsAfterDeposit = clmHarvests.filter(h =>
      isAfter(h.timestamp, firstDeposit.datetime)
    );

    if (clmHarvestsAfterDeposit.length === 0) {
      console.warn(`No clm harvests found after first deposit for vault ${vaultId}`);
      return result;
    }

    // We now have a timeline of both vault harvests: standard(ppfs and hence underlying increase) and clm(compounded fees)
    const mergedHarvests = [...vaultHarvestsAfterDeposit, ...clmHarvestsAfterDeposit].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const lastTimelineIdx = timeline.current.length - 1;
    let timelineIdx = 0;

    let currentUnderlying = timeline.current[timelineIdx].underlyingBalance;
    let currentShares = timeline.current[timelineIdx].shareBalance;
    for (const harvest of mergedHarvests) {
      while (
        timelineIdx < lastTimelineIdx &&
        isAfter(harvest.timestamp, timeline.current[timelineIdx + 1].datetime)
      ) {
        currentUnderlying = timeline.current[++timelineIdx].underlyingBalance;
        currentShares = timeline.current[timelineIdx].shareBalance;
      }

      // If we see a standard harvest, we update the current underlying balance
      if (harvest.type === 'classic') {
        currentUnderlying = currentUnderlying.plus(
          harvest.compoundedAmount.times(currentShares).dividedBy(harvest.totalSupply)
        );
      } else {
        //fee harvest
        const token0share = currentUnderlying
          .multipliedBy(harvest.compoundedAmount0)
          .dividedBy(harvest.totalSupply);
        const token1share = currentUnderlying
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
          cumulativeAmounts:
            previous ? amounts.map((a, i) => a.plus(previous.cumulativeAmounts[i])) : amounts,
          cumulativeAmountsUsd:
            previous ?
              amountsUsd.map((a, i) => a.plus(previous.cumulativeAmountsUsd[i]))
            : amountsUsd,
          cumulativeTotalUsd: previous ? previous.cumulativeTotalUsd.plus(totalUsd) : totalUsd,
        });
      }
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
  vaultIds: VaultEntity['id'][];
}

export const fetchClmPendingRewards = createAppAsyncThunk<
  FetchClmPendingRewardsFulfilledAction,
  {
    vaultId: VaultEntity['id'];
  }
>('analytics/fetchClmPendingRewards', async ({ vaultId }, { getState }) => {
  const state = getState();
  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const [token0, token1] = selectCowcentratedLikeVaultDepositTokens(state, vaultId);
  const clmStrategyAddress = selectVaultStrategyAddress(state, vault.cowcentratedIds.clm);
  const chain = selectChainById(state, vault.chainId);
  const api = await getClmApi();

  const { fees0, fees1, totalSupply } = await api.getClmPendingRewards(
    chain,
    clmStrategyAddress,
    getCowcentratedAddressFromCowcentratedLikeVault(vault)
  );

  return {
    data: {
      fees0: fees0.shiftedBy(-token0.decimals),
      fees1: fees1.shiftedBy(-token1.decimals),
      totalSupply: totalSupply.shiftedBy(-18),
    },
    vaultIds: [vault.id, ...vault.cowcentratedIds.pools, ...vault.cowcentratedIds.vaults].filter(
      isDefined
    ),
  };
});

export const initDashboardByAddress = createAppAsyncThunk<
  {
    walletAddress: string;
  },
  {
    walletAddress: string;
  }
>('analytics/initDashboardByAddress', async ({ walletAddress }, { getState, dispatch }) => {
  const state = getState();
  const chains = selectAllChainIds(state);
  const lowerCaseAddress = walletAddress.toLowerCase();

  const promises = chains
    .map(chainId => {
      if (selectDashboardShouldLoadBalanceForChainUser(state, chainId, lowerCaseAddress)) {
        return dispatch(fetchAllBalanceAction({ chainId, walletAddress: lowerCaseAddress }));
      }
    })
    .filter(isDefined);

  await Promise.allSettled(promises);
  await dispatch(fetchUserOffChainRewardsForDepositedVaultsAction(walletAddress));

  return { walletAddress: lowerCaseAddress };
});
