import { first } from 'lodash-es';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { bigNumberEqual, shallowArrayEqual } from '../utils/selector-equality.ts';
import { createCachedSelector } from 're-reselect';
import { EMPTY_AVG_APY } from '../../../helpers/apy.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { formatTotalApy } from '../../../helpers/format.ts';
import { isEmpty } from '../../../helpers/utils.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isVaultActive,
  type VaultEntity,
  getCowcentratedGroupIds,
} from '../entities/vault.ts';
import type { AvgApy, TotalApy } from '../reducers/apy-types.ts';
import type { BeefyState } from '../store/types.ts';
import { mooAmountToOracleAmount } from '../utils/ppfs.ts';
import {
  selectBoostUserBalanceInToken,
  selectDashboardRowSideIds,
  selectIsUserBalanceAvailable,
  selectUserDashboardVaultIds,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectVaultSharesToDepositTokenData,
} from './balance.ts';
import { selectActiveVaultBoostIds, selectVaultCurrentBoostIdWithStatus } from './boosts.ts';
import { selectIsConfigAvailable } from './data-loader/config.ts';
import { selectIsContractDataLoadedOnChain } from './data-loader/contract-data.ts';
import { selectVaultActiveExtraRewardTokens, selectVaultActiveGovRewards } from './rewards.ts';
import { selectGovVaultEarnedTokens, selectTokenPriceByAddress } from './tokens.ts';
import {
  selectVaultById,
  selectVaultByIdOrUndefined,
  selectVaultShouldShowInterest,
} from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';
import { selectIsApyAvailable } from './data-loader/apy.ts';

const EMPTY_TOTAL_APY: TotalApy = {
  totalApy: 0,
  totalMonthly: 0,
  totalDaily: 0,
  totalType: 'apy',
};

export const selectVaultTotalApyOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<TotalApy> | undefined => {
  return state.biz.apy.totalApy.byVaultId[vaultId] || undefined;
};

export const selectVaultTotalApy = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<TotalApy> => {
  return selectVaultTotalApyOrUndefined(state, vaultId) || EMPTY_TOTAL_APY;
};

export const selectVaultAvgApyOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<AvgApy> | undefined => {
  return state.biz.apy.avgApy.byVaultId[vaultId] || undefined;
};

export const selectVaultAvgApy = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<AvgApy> => {
  return selectVaultAvgApyOrUndefined(state, vaultId) || EMPTY_AVG_APY;
};

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

/**
 * The group member whose rate represents a merged CLM row: always the autocompounding side when it
 * exists. Pass-through for anything that is not a base CLM.
 *
 * The two sides are not comparable. Both earn the same CLM trading fees, but the pool reports them
 * gross as claimable while the vault reports them compounded and net of the performance fee, so the
 * pool's headline is higher by construction — measured at 9.5% of the fee component, never more
 * than a point. Picking "whichever is higher" therefore always chose the pool, swapping the unit
 * from APY to APR for a fraction of a point of a rate the user has to claim by hand.
 */
export const selectClmDisplayVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'] => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedVault(vault)) {
    return vaultId;
  }

  const { pool, vault: vaultSide, pools, vaults } = vault.cowcentratedIds;
  // the claimable side only represents the group when there is no compounding side at all
  return vaultSide ?? pool ?? vaults[0] ?? pools[0] ?? vaultId;
};

const EMPTY_GLOBAL_STATS = {
  deposited: 0,
  daily: 0,
  weekly: 0,
  monthly: 0,
  yearly: 0,
  apy: 0,
  depositedVaults: 0,
};

/**
 * Ignores boost component of APY
 */
export const selectUserGlobalStats = (state: BeefyState, address?: string) => {
  const walletAddress = address || selectWalletAddress(state);
  if (!walletAddress) {
    return EMPTY_GLOBAL_STATS;
  }

  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return EMPTY_GLOBAL_STATS;
  }

  const userVaultIds = selectUserDepositedVaultIds(state, walletAddress);

  if (userVaultIds.length === 0) {
    return EMPTY_GLOBAL_STATS;
  }

  const newGlobalStats = {
    ...EMPTY_GLOBAL_STATS,
    // one per product, like the dashboard rows; the sums below stay per wrapper
    depositedVaults: selectUserDashboardVaultIds(state, walletAddress).length,
  };

  const userVaults = userVaultIds.map(vaultId => selectVaultById(state, vaultId));

  for (const vault of userVaults) {
    const vaultUsdBalance = selectUserVaultBalanceInUsdIncludingDisplaced(
      state,
      vault.id,
      walletAddress
    ).toNumber();

    if (vaultUsdBalance <= 0) {
      continue;
    }

    // Add vault balance to total
    newGlobalStats.deposited += vaultUsdBalance;

    if (!isVaultActive(vault)) {
      continue;
    }

    // Add period totals for each vault
    const apyData = selectVaultTotalApy(state, vault.id);

    if (isEmpty(apyData)) {
      continue;
    }
    const { dailyUsd, weeklyUsd, monthlyUsd, yearlyUsd } = selectYieldStatsByVaultId(
      state,
      vault.id,
      walletAddress
    );

    newGlobalStats.daily += dailyUsd.toNumber();
    newGlobalStats.weekly += weeklyUsd.toNumber();
    newGlobalStats.monthly += monthlyUsd.toNumber();
    newGlobalStats.yearly += yearlyUsd.toNumber();
  }

  // Skip yield calc if user has no deposits
  if (newGlobalStats.deposited <= 0) {
    return newGlobalStats;
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly / newGlobalStats.deposited;

  return newGlobalStats;
};

const selectYieldStatsByVaultIdUncached = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const shareData = selectVaultSharesToDepositTokenData(state, vaultId, walletAddress);

  if (!isVaultActive(vault)) {
    return {
      dailyUsd: BIG_ZERO,
      dailyTokens: BIG_ZERO,
      weeklyTokens: BIG_ZERO,
      weeklyUsd: BIG_ZERO,
      monthlyTokens: BIG_ZERO,
      monthlyUsd: BIG_ZERO,
      yearlyUsd: BIG_ZERO,
      yearlyTokens: BIG_ZERO,
      oraclePrice,
      depositToken: shareData.depositToken,
    };
  }

  const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
    state,
    vault.id,
    walletAddress
  );
  const apyData = selectVaultTotalApy(state, vault.id);
  const sources = [
    // base total apy is applied to the whole of the user's balance
    {
      daily: apyData.totalDaily,
      weekly: apyData.totalDaily * 7,
      yearly: apyData.totalApy,
      tokens: tokenBalance,
    },
  ];

  if (apyData.boostApr !== undefined && apyData.boostDaily !== undefined) {
    const activeBoostId = first(selectActiveVaultBoostIds(state, vaultId));
    if (activeBoostId) {
      const sharesInBoost = selectBoostUserBalanceInToken(state, activeBoostId, walletAddress);
      if (sharesInBoost.gt(BIG_ZERO)) {
        const tokensInBoost =
          shareData.shareToken ?
            mooAmountToOracleAmount(
              shareData.shareToken,
              shareData.depositToken,
              shareData.ppfs,
              sharesInBoost
            )
          : sharesInBoost;

        // boost apy is applied only to the user's balance in the boost
        sources.push({
          daily: apyData.boostDaily,
          weekly: apyData.boostDaily * 7,
          yearly: apyData.boostApr,
          tokens: tokensInBoost,
        });
      }
    }
  }

  if (apyData.merklBoostApr !== undefined && apyData.merklBoostDaily !== undefined) {
    // merkl boost apy is applied to the whole of the user's balance
    sources.push({
      daily: apyData.merklBoostDaily,
      weekly: apyData.merklBoostDaily * 7,
      yearly: apyData.merklBoostApr,
      tokens: tokenBalance,
    });
  }

  const total = sources.reduce(
    (acc, source) => {
      for (const key of ['daily', 'yearly'] as const) {
        acc[key] = acc[key].plus(source.tokens.multipliedBy(source[key]));
      }
      return acc;
    },
    { daily: BIG_ZERO, yearly: BIG_ZERO }
  );

  const dailyTokens = total.daily;
  const dailyUsd = total.daily.times(oraclePrice);
  const weeklyTokens = dailyTokens.times(7);
  const weeklyUsd = dailyUsd.times(7);
  const monthlyTokens = dailyTokens.times(30);
  const monthlyUsd = dailyUsd.times(30);
  const yearlyTokens = total.yearly;
  const yearlyUsd = total.yearly.times(oraclePrice);

  return {
    dailyUsd,
    dailyTokens,
    weeklyTokens,
    weeklyUsd,
    monthlyTokens,
    monthlyUsd,
    yearlyTokens,
    yearlyUsd,
    oraclePrice,
    depositToken: shareData.depositToken,
  };
};

/**
 * A dashboard CLM row's rate when both sides earn: the mean of the rates each side quotes — the
 * vault's APY, the pool's APR — weighted by deposit. Daily sums the sides' simple daily rates, so it
 * runs a little under this x deposit / 365. Undefined until every side has its rate.
 */
export const selectDashboardClmBlendedApy = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
): number | undefined => {
  const ids = selectDashboardRateVaultIds(state, vaultId, walletAddress);
  if (ids.length < 2 || ids.some(id => !selectVaultTotalApyOrUndefined(state, id))) {
    return undefined;
  }
  let yearly = BIG_ZERO;
  let deposit = BIG_ZERO;
  for (const id of ids) {
    yearly = yearly.plus(selectYieldStatsByVaultId(state, id, walletAddress).yearlyUsd);
    deposit = deposit.plus(selectUserVaultBalanceInUsdIncludingDisplaced(state, id, walletAddress));
  }
  return deposit.gt(BIG_ZERO) ? yearly.div(deposit).toNumber() : undefined;
};

/** the held sides a dashboard CLM row quotes a rate for: those still earning, autocompound first */
export const selectDashboardRateVaultIds = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    selectDashboardRowSideIds(state, vaultId, walletAddress),
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress: string) =>
    state.entities.vaults.byId,
  (ids, byId) => ids.filter(id => isVaultActive(byId[id]!)),
  { memoizeOptions: { resultEqualityCheck: shallowArrayEqual } }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${vaultId}-${walletAddress.toLowerCase()}`
);

/** the side a dashboard row's single rate and status come from; a retired one reads "-" */
export const selectDashboardRateVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
): VaultEntity['id'] =>
  selectDashboardRateVaultIds(state, vaultId, walletAddress)[0] ??
  selectDashboardRowSideIds(state, vaultId, walletAddress)[0];

/** a dashboard row's $/day: a CLM row's earning sides, as the portfolio Daily counts them */
export const selectDashboardRowDailyUsd = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress: string) => state,
  (_state: BeefyState, vaultId: VaultEntity['id'], _walletAddress: string) => vaultId,
  (_state: BeefyState, _vaultId: VaultEntity['id'], walletAddress: string) => walletAddress,
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    selectDashboardRowSideIds(state, vaultId, walletAddress)[0] === vaultId ?
      selectYieldStatsByVaultId(state, vaultId, walletAddress).dailyUsd
    : selectDashboardRateVaultIds(state, vaultId, walletAddress).reduce(
        (sum, id) => sum.plus(selectYieldStatsByVaultId(state, id, walletAddress).dailyUsd),
        BIG_ZERO
      ),
  { memoizeOptions: { resultEqualityCheck: bigNumberEqual } }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${vaultId}-${walletAddress.toLowerCase()}`
);

export type ApyVaultUIData =
  | {
      status: 'loading' | 'missing' | 'hidden';
      type: 'apy' | 'apr';
    }
  | {
      status: 'available';
      type: 'apy' | 'apr';
      values: TotalApy;
      boosted: 'active' | 'prestake' | undefined;
      averages: AvgApy | undefined;
    };

export const selectIsVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state) || !selectIsApyAvailable(state)) {
    return false;
  }

  const vault = selectVaultById(state, vaultId);
  return selectIsContractDataLoadedOnChain(state, vault.chainId);
};

const APY_UI_STATUS_ONLY: Record<
  'hidden' | 'loading' | 'missing',
  Record<'apy' | 'apr', ApyVaultUIData>
> = {
  hidden: {
    apy: Object.freeze({ status: 'hidden', type: 'apy' }),
    apr: Object.freeze({ status: 'hidden', type: 'apr' }),
  },
  loading: {
    apy: Object.freeze({ status: 'loading', type: 'apy' }),
    apr: Object.freeze({ status: 'loading', type: 'apr' }),
  },
  missing: {
    apy: Object.freeze({ status: 'missing', type: 'apy' }),
    apr: Object.freeze({ status: 'missing', type: 'apr' }),
  },
};

/** the percentage a side's own stat shows, boosted when a boost is live */
export function formatApyUIRate(
  data: ApyVaultUIData | undefined
): { value: string; type: 'apr' | 'apy' } | undefined {
  if (!data || data.status !== 'available') {
    return undefined;
  }
  const formatted = formatTotalApy(data.values, '???');
  const value =
    (data.boosted === 'active' ? formatted.boostedTotalApy : undefined) ?? formatted.totalApy;
  return value ? { value, type: data.type } : undefined;
}

export const selectApyVaultUIData = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultShouldShowInterest(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectIsVaultApyAvailable(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectDidAPIReturnValuesForVault(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultTotalApy(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultCurrentBoostIdWithStatus(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultAvgApyOrUndefined(state, vaultId),
  (vault, shouldShowInterest, isLoaded, exists, values, boost, averages): ApyVaultUIData => {
    const type: 'apr' | 'apy' = vault.type === 'gov' ? 'apr' : 'apy';

    if (!shouldShowInterest) {
      return APY_UI_STATUS_ONLY.hidden[type];
    }

    if (!isLoaded) {
      return APY_UI_STATUS_ONLY.loading[type];
    }

    if (!exists) {
      return APY_UI_STATUS_ONLY.missing[type];
    }

    if (boost) {
      return { status: 'available', type, values, boosted: boost.status, averages };
    }

    if (!isCowcentratedVault(vault) && !isCowcentratedGovVault(vault)) {
      return { status: 'available', type, values, boosted: undefined, averages };
    }

    return {
      status: 'available',
      type: values.totalType,
      values,
      boosted: 'boostedTotalDaily' in values ? 'active' : undefined,
      averages,
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectBoostAprByRewardToken = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return arrayOrStaticEmpty(state.biz.apy.rawApy.byBoostId[boostId]?.aprByRewardToken);
};

type VaultYieldStats = ReturnType<typeof selectYieldStatsByVaultIdUncached>;

function yieldStatsEqual(a: VaultYieldStats, b: VaultYieldStats): boolean {
  return (
    a === b ||
    (a.depositToken === b.depositToken &&
      bigNumberEqual(a.oraclePrice, b.oraclePrice) &&
      bigNumberEqual(a.dailyTokens, b.dailyTokens) &&
      bigNumberEqual(a.dailyUsd, b.dailyUsd) &&
      bigNumberEqual(a.weeklyTokens, b.weeklyTokens) &&
      bigNumberEqual(a.weeklyUsd, b.weeklyUsd) &&
      bigNumberEqual(a.monthlyTokens, b.monthlyTokens) &&
      bigNumberEqual(a.monthlyUsd, b.monthlyUsd) &&
      bigNumberEqual(a.yearlyTokens, b.yearlyTokens) &&
      bigNumberEqual(a.yearlyUsd, b.yearlyUsd))
  );
}

export const selectYieldStatsByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], _walletAddress?: string) => state,
  (_state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) => vaultId,
  (_state: BeefyState, _vaultId: VaultEntity['id'], walletAddress?: string) => walletAddress,
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string | undefined) =>
    selectYieldStatsByVaultIdUncached(state, vaultId, walletAddress),
  { memoizeOptions: { resultEqualityCheck: yieldStatsEqual } }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    `${vaultId}-${walletAddress ?? ''}`
);

/**
 * The group's reward streams split per stream, scaled to whatever the shown wrapper actually pays.
 *
 * Only the pool wrapper reports the split; the vault wrapper reports one aggregate `vaultApr` that
 * folds Merkl in and is net of the performance fee, so reading it directly attributes Merkl to
 * trading rewards. Taking the pool's proportions and scaling them to the shown side's aggregate
 * keeps each stream attributed while the rows still reconcile with the total above them.
 */
export const selectClmRewardBreakdown = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultByIdOrUndefined(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultByIdOrUndefined(state, vaultId);
    const poolId =
      vault && isCowcentratedLikeVault(vault) ?
        (vault.cowcentratedIds.pool ?? vault.cowcentratedIds.pools[0])
      : undefined;
    return poolId ? selectVaultTotalApyOrUndefined(state, poolId) : undefined;
  },
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultTotalApyOrUndefined(state, vaultId),
  (vault, poolApy, shownApy): { rewardPoolTradingApr: number; merklApr: number } | undefined => {
    if (!vault || !isCowcentratedLikeVault(vault) || !poolApy) {
      return undefined;
    }
    const poolId = vault.cowcentratedIds.pool ?? vault.cowcentratedIds.pools[0];
    const trading = poolApy.rewardPoolTradingApr ?? 0;
    const merkl = poolApy.merklApr ?? 0;
    const gross = trading + merkl;

    const shownRewards =
      vault.id === poolId ?
        gross
        // the vault wrapper's single aggregate: the same streams, harvested and net of the fee
      : (shownApy?.vaultApr ?? 0);
    // gross of 0 means nothing to split, and the scale would be undefined
    const scale = gross > 0 ? shownRewards / gross : 0;

    return {
      rewardPoolTradingApr: trading * scale,
      merklApr: merkl * scale,
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

/**
 * The user's own rate across a CLM group, as a DAILY figure, when they hold both wrappers: both
 * sides' $/day over both sides' USD, so it agrees with the Daily stat. Annualising it would not be
 * honest — one side compounds and the other does not. Undefined unless both sides are held.
 */
export const selectClmBlendedDaily = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): number | undefined => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  if (!vault || !isCowcentratedLikeVault(vault)) {
    return undefined;
  }
  const { pool, vault: vaultSide } = vault.cowcentratedIds;
  if (!pool || !vaultSide) {
    return undefined;
  }

  const sides = [vaultSide, pool].map(id => ({
    usd: selectUserVaultBalanceInUsdIncludingDisplaced(state, id, walletAddress),
    hasApy: !!selectVaultTotalApyOrUndefined(state, id),
    // the same $/day the Daily stat and the portfolio total use, boosts included
    dailyUsd: selectYieldStatsByVaultId(state, id, walletAddress).dailyUsd,
  }));
  // one side only is not a blend; the rows already describe it
  if (sides.some(side => side.usd.lte(BIG_ZERO) || !side.hasApy)) {
    return undefined;
  }

  const total = sides.reduce((sum, side) => sum.plus(side.usd), BIG_ZERO);
  return sides
    .reduce((sum, side) => sum.plus(side.dailyUsd), BIG_ZERO)
    .dividedBy(total)
    .toNumber();
};

/** the symbols a CLM pays out today: what its pool streams on-chain, plus live campaign tokens */
export const selectClmPayoutTokens = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): string[] | undefined => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  if (!vault || !isCowcentratedLikeVault(vault)) {
    return undefined;
  }

  // every active CLM has a pool wrapper (0 vault-only measured); a retired one still names tokens
  const pool = vault.cowcentratedIds.pool ?? vault.cowcentratedIds.pools[0];
  if (!pool) {
    return undefined;
  }

  // what the pool streams on-chain right now, as the claim form reads it; `earnedTokenAddresses` is
  // config-only and stale both ways, so it stands in just until the contract data lands
  const streamed = selectVaultActiveGovRewards(state, pool);
  const symbols = new Set(
    streamed ?
      streamed.map(reward => reward.token.symbol)
    : selectGovVaultEarnedTokens(state, vault.chainId, pool).map(token => token.symbol)
  );
  // off-chain campaigns pay tokens the pool never streams, and register against any group member
  for (const id of getCowcentratedGroupIds(vault)) {
    for (const token of selectVaultActiveExtraRewardTokens(state, id) ?? []) {
      symbols.add(token.symbol);
    }
  }

  return [...symbols];
};
