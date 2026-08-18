import { first } from 'lodash-es';
import { EMPTY_AVG_APY } from '../../../helpers/apy.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
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
  selectIsUserBalanceAvailable,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectVaultSharesToDepositTokenData,
} from './balance.ts';
import { selectActiveVaultBoostIds, selectVaultCurrentBoostIdWithStatus } from './boosts.ts';
import { selectIsConfigAvailable } from './data-loader/config.ts';
import { selectIsContractDataLoadedOnChain } from './data-loader/contract-data.ts';
import { selectVaultActiveMerklCampaigns } from './rewards.ts';
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
    depositedVaults: userVaultIds.length,
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

export const selectYieldStatsByVaultId = (
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

type ApyVaultUIData =
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

// TEMP: selector instead of connect/mapStateToProps
export function selectApyVaultUIData(
  state: BeefyState,
  vaultId: VaultEntity['id']
): ApyVaultUIData {
  const vault = selectVaultById(state, vaultId);
  const type: 'apr' | 'apy' = vault.type === 'gov' ? 'apr' : 'apy';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return { status: 'hidden', type };
  }

  const isLoaded = selectIsVaultApyAvailable(state, vaultId);
  if (!isLoaded) {
    return { status: 'loading', type };
  }

  const exists = selectDidAPIReturnValuesForVault(state, vaultId);
  if (!exists) {
    return { status: 'missing', type };
  }

  const values = selectVaultTotalApy(state, vaultId);
  const boost = selectVaultCurrentBoostIdWithStatus(state, vaultId);
  const averages = selectVaultAvgApyOrUndefined(state, vaultId);

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

export const selectBoostAprByRewardToken = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return state.biz.apy.rawApy.byBoostId[boostId]?.aprByRewardToken || [];
};

export const selectBoostApr = (state: BeefyState, boostId: string): number => {
  return state.biz.apy.rawApy.byBoostId[boostId]?.apr || 0;
};

/**
 * The side a merged CLM row is NOT showing, for the tooltip footer. `undefined` unless the group
 * has both sides live, so a single-sided CLM renders the same tooltip it always did.
 */
/**
 * The group's reward streams split per stream, scaled to whatever the shown wrapper actually pays.
 *
 * Only the pool wrapper reports the split; the vault wrapper reports one aggregate `vaultApr` that
 * folds Merkl in and is net of the performance fee, so reading it directly attributes Merkl to
 * trading rewards. Taking the pool's proportions and scaling them to the shown side's aggregate
 * keeps each stream attributed while the rows still reconcile with the total above them.
 */
export const selectClmRewardBreakdown = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): { rewardPoolTradingApr: number; merklApr: number } | undefined => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  if (!vault || !isCowcentratedLikeVault(vault)) {
    return undefined;
  }
  const poolId = vault.cowcentratedIds.pool ?? vault.cowcentratedIds.pools[0];
  if (!poolId) {
    return undefined;
  }
  const poolApy = selectVaultTotalApyOrUndefined(state, poolId);
  if (!poolApy) {
    return undefined;
  }
  const trading = poolApy.rewardPoolTradingApr ?? 0;
  const merkl = poolApy.merklApr ?? 0;
  const gross = trading + merkl;

  const shownApy = selectVaultTotalApyOrUndefined(state, vaultId);
  const shownRewards =
    vaultId === poolId ? gross
      // the vault wrapper's single aggregate: the same streams, harvested and net of the fee
    : (shownApy?.vaultApr ?? 0);
  // gross of 0 means nothing to split, and the scale would be undefined
  const scale = gross > 0 ? shownRewards / gross : 0;

  return {
    rewardPoolTradingApr: trading * scale,
    merklApr: merkl * scale,
  };
};

/**
 * The user's own rate across a CLM group, as a DAILY figure, when they hold both wrappers.
 *
 * Daily is the only honest granularity here: both sides' `totalDaily` is a simple daily rate on the
 * same principal, so a USD-weighted mean is exact. Annualising it would not be — one side compounds
 * and the other does not, so a single blended APY would silently assert a reinvestment policy on
 * the user's behalf. Returns undefined unless both sides are actually held.
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
    daily: selectVaultTotalApyOrUndefined(state, id)?.totalDaily ?? 0,
  }));
  // one side only is not a blend; the rows already describe it
  if (sides.some(side => side.usd.lte(BIG_ZERO))) {
    return undefined;
  }

  const total = sides.reduce((sum, side) => sum.plus(side.usd), BIG_ZERO);
  return sides
    .reduce((sum, side) => sum.plus(side.usd.multipliedBy(side.daily)), BIG_ZERO)
    .dividedBy(total)
    .toNumber();
};

export const selectClmPayoutTokens = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): { compound: string[]; claim: string[] } | undefined => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  if (!vault || !isCowcentratedLikeVault(vault)) {
    return undefined;
  }

  // every active CLM has a pool wrapper (0 vault-only measured); a retired one still names tokens
  const pool = vault.cowcentratedIds.pool ?? vault.cowcentratedIds.pools[0];
  if (!pool) {
    return undefined;
  }

  // gov-streamed rewards plus Merkl campaign tokens: some pools stream nothing themselves and
  // pay only via Merkl (earnedTokenAddresses is empty), and campaigns can register against any
  // member of the group
  const claim = new Set(
    selectGovVaultEarnedTokens(state, vault.chainId, pool).map(token => token.symbol)
  );
  for (const id of getCowcentratedGroupIds(vault)) {
    for (const campaign of selectVaultActiveMerklCampaigns(state, id) ?? []) {
      claim.add(campaign.rewardToken.symbol);
    }
  }

  return {
    compound: vault.assetIds,
    claim: [...claim],
  };
};
