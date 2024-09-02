import type { BeefyState } from '../../../redux-types';
import {
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../entities/vault';
import { selectWalletAddress, selectWalletAddressIfKnown } from './wallet';
import type { TokenEntity } from '../entities/token';
import type BigNumber from 'bignumber.js';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import { selectIsVaultStable, selectVaultById } from './vaults';
import { selectAllVaultBoostIds } from './boosts';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectHasBreakdownDataForVault,
  selectIsTokenStable,
  selectLpBreakdownForVault,
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
  selectTokenPriceByTokenOracleId,
  selectVaultTokenSymbols,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens';
import {
  isUserClmPnl,
  isUserGovPnl,
  isUserStandardPnl,
  type UserClmPnl,
  type UserGovPnl,
  type UserStandardPnl,
  type UserVaultPnl,
} from './analytics-types';
import { getTopNArray } from '../utils/array-utils';
import { orderBy } from 'lodash-es';
import { selectPlatformById } from './platforms';
import { selectChainById } from './chains';
import {
  selectIsAnalyticsLoadedByAddress,
  selectIsClmHarvestsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
  selectVaultPnl,
} from './analytics';
import type { ChainEntity } from '../entities/chain';
import type { UserLpBreakdownBalanceAsset } from './balance-types';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserRewardsInToken,
  selectGovVaultPendingRewardsWithPrice,
  selectUserDepositedVaultIds,
  selectUserLpBreakdownBalance,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
} from './balance';
import { selectIsUserBalanceAvailable } from './data-loader';

export const selectUserTotalYieldUsd = (state: BeefyState, walletAddress: string) => {
  const vaultPnls = selectDashboardUserVaultsPnl(state, walletAddress);

  let totalYieldUsd = BIG_ZERO;
  for (const vaultPnl of Object.values(vaultPnls)) {
    totalYieldUsd = totalYieldUsd.plus(
      isUserClmPnl(vaultPnl) ? vaultPnl.yields.usd : vaultPnl.totalYieldUsd
    );
  }

  return totalYieldUsd;
};
export const selectDashboardUserRewardsByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  walletAddress = walletAddress || selectWalletAddress(state);

  const rewards: {
    rewardToken: TokenEntity['symbol'];
    rewardTokenDecimals: TokenEntity['decimals'];
    rewards: BigNumber;
    rewardsUsd: BigNumber;
  }[] = [];
  const rewardsTokens: string[] = [];
  let totalRewardsUsd = BIG_ZERO;

  if (!walletAddress) {
    return { rewards, rewardsTokens, totalRewardsUsd };
  }

  const vault = selectVaultById(state, vaultId);

  if (isGovVault(vault)) {
    const pendingRewards = selectGovVaultPendingRewardsWithPrice(state, vault.id, walletAddress);
    for (const pendingReward of pendingRewards) {
      if (pendingReward.amount.isGreaterThan(BIG_ZERO)) {
        const tokenRewardsUsd = pendingReward.amount.times(pendingReward.price || BIG_ZERO);

        totalRewardsUsd = totalRewardsUsd.plus(tokenRewardsUsd);
        rewardsTokens.push(pendingReward.token.symbol);

        rewards.push({
          rewardToken: pendingReward.token.symbol,
          rewardTokenDecimals: pendingReward.token.decimals,
          rewards: pendingReward.amount,
          rewardsUsd: tokenRewardsUsd,
        });
      }
    }
  } else {
    const boosts = selectAllVaultBoostIds(state, vaultId);
    for (const boostId of boosts) {
      const boostPendingRewards = selectBoostUserRewardsInToken(state, boostId, walletAddress);
      if (boostPendingRewards.isGreaterThan(BIG_ZERO)) {
        const rewardToken = selectBoostRewardsTokenEntity(state, boostId);
        const oraclePrice = selectTokenPriceByTokenOracleId(state, rewardToken.oracleId);
        const tokenRewardsUsd = boostPendingRewards.times(oraclePrice);

        rewardsTokens.push(rewardToken.symbol);
        totalRewardsUsd = totalRewardsUsd.plus(tokenRewardsUsd);

        rewards.push({
          rewardToken: rewardToken.symbol,
          rewardTokenDecimals: rewardToken.decimals,
          rewards: boostPendingRewards,
          rewardsUsd: tokenRewardsUsd,
        });
      }
    }
  }

  return { rewards, rewardsTokens, totalRewardsUsd };
};
type DashboardUserExposureVaultEntry = { key: string; label: string; value: BigNumber };
type DashboardUserExposureVaultFn<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry
> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  vaultTvl: BigNumber,
  walletAddress: string
) => T[];
type DashboardUserExposureEntry<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry
> = T & {
  percentage: number;
};
type DashboardUserExposureSummarizer<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry
> = (entries: DashboardUserExposureEntry<T>[]) => DashboardUserExposureEntry<T>[];
type DashboardUserTokenExposureVaultEntry = DashboardUserExposureVaultEntry & {
  symbols: string[];
  chainId: ChainEntity['id'];
};
type DashboardUserChainExposureVaultEntry = DashboardUserExposureVaultEntry & {
  chainId: ChainEntity['id'] | 'others';
};
const getDashboardLpBreakdownScalingFactor = (
  vaultId: string,
  userVaultTvl: BigNumber,
  assets: UserLpBreakdownBalanceAsset[]
) => {
  const assetValueTotal = assets.reduce((sum, asset) => sum.plus(asset.userValue), BIG_ZERO);
  let scaleFactor = BIG_ONE;
  if (assetValueTotal.gt(userVaultTvl)) {
    if (assetValueTotal.gt(userVaultTvl.times(1.01))) {
      // If more than % out, warn in console, and let UI show over 100%
      /*console.warn(
        `[${vaultId}] Total asset value (${assetValueTotal.toString(
          10
        )}) from user LP breakdown is >1% greater than user's total vault deposit (${userVaultTvl.toString(
          10
        )})`
      );*/
    } else {
      // If less than % out, just scale user values down equally to not go over 100%
      scaleFactor = userVaultTvl.dividedBy(assetValueTotal);
    }
  }
  return scaleFactor;
};
const top6ByPercentageSummarizer = <
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry
>(
  entries: DashboardUserExposureEntry<T>[]
) =>
  getTopNArray(entries, 'percentage', 6, {
    key: 'others',
    label: 'Others',
    value: BIG_ZERO,
    percentage: 0,
  });
const stableVsOthersSummarizer = (entries: DashboardUserExposureEntry[]) =>
  orderBy(entries, 'key', 'desc');
const selectDashboardUserExposure = <
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry
>(
  state: BeefyState,
  vaultFn: DashboardUserExposureVaultFn<T>,
  summarizerFn: DashboardUserExposureSummarizer<T>,
  maybeWalletAddress?: string
): DashboardUserExposureEntry<T>[] => {
  const walletAddress = maybeWalletAddress || selectWalletAddressIfKnown(state);
  if (!walletAddress) {
    return [];
  }

  const vaultIds = selectUserDepositedVaultIds(state, walletAddress);
  if (!vaultIds.length) {
    return [];
  }

  const vaultDeposits = vaultIds.map(vaultId =>
    selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId, walletAddress)
  );
  const totalDeposits = vaultDeposits.reduce((acc, deposit) => acc.plus(deposit), BIG_ZERO);
  const entries = vaultIds
    .map((vaultId, i) => vaultFn(state, vaultId, vaultDeposits[i], walletAddress))
    .flat();
  const byKey = entries.reduce((acc, entry) => {
    if (!acc[entry.key]) {
      acc[entry.key] = entry;
    } else {
      acc[entry.key].value = acc[entry.key].value.plus(entry.value);
    }
    return acc;
  }, {} as Record<DashboardUserExposureVaultEntry['key'], T>);

  const entriesWithPercentage = Object.values(byKey).map(entry => ({
    ...entry,
    percentage: entry.value.dividedBy(totalDeposits).toNumber(),
  }));

  return summarizerFn(entriesWithPercentage);
};
const selectDashboardUserVaultChainExposure: DashboardUserExposureVaultFn<
  DashboardUserChainExposureVaultEntry
> = (state, vaultId, vaultTvl, _walletAddress) => {
  const vault = selectVaultById(state, vaultId);
  const chain = selectChainById(state, vault.chainId);
  return [{ key: chain.id, label: chain.name, value: vaultTvl, chainId: chain.id }];
};
export const selectDashboardUserExposureByChain = (state: BeefyState, walletAddress?: string) =>
  selectDashboardUserExposure(
    state,
    selectDashboardUserVaultChainExposure,
    entries =>
      getTopNArray(entries, 'percentage', 6, {
        key: 'others',
        label: 'Others',
        value: BIG_ZERO,
        percentage: 0,
        chainId: 'others' as const,
      }),
    walletAddress
  );
const selectDashboardUserVaultPlatformExposure: DashboardUserExposureVaultFn = (
  state,
  vaultId,
  vaultTvl,
  _walletAddress
) => {
  const vault = selectVaultById(state, vaultId);
  const platform = selectPlatformById(state, vault.platformId);
  return [{ key: platform.id, label: platform.name, value: vaultTvl }];
};
export const selectDashboardUserExposureByPlatform = (state: BeefyState, walletAddress?: string) =>
  selectDashboardUserExposure(
    state,
    selectDashboardUserVaultPlatformExposure,
    top6ByPercentageSummarizer,
    walletAddress
  );
const selectDashboardUserVaultTokenExposure: DashboardUserExposureVaultFn<
  DashboardUserTokenExposureVaultEntry
> = (state, vaultId, vaultTvl, walletAddress): DashboardUserTokenExposureVaultEntry[] => {
  const vault = selectVaultById(state, vaultId);

  if (vault.assetIds.length === 1) {
    const token = selectTokenByIdOrUndefined(state, vault.chainId, vault.assetIds[0]);
    const symbol = selectWrappedToNativeSymbolOrTokenSymbol(
      state,
      token ? token.symbol : vault.assetIds[0]
    );
    return [
      { key: symbol, label: symbol, value: vaultTvl, symbols: [symbol], chainId: vault.chainId },
    ];
  }

  const haveBreakdownData = selectHasBreakdownDataForVault(state, vault);
  if (haveBreakdownData) {
    const breakdown = selectLpBreakdownForVault(state, vault);
    const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
    const scaleFactor = getDashboardLpBreakdownScalingFactor(vaultId, vaultTvl, assets);

    return assets.map(asset => {
      const symbol = selectWrappedToNativeSymbolOrTokenSymbol(state, asset.symbol);
      return {
        key: symbol,
        label: symbol,
        value: asset.userValue.multipliedBy(scaleFactor),
        symbols: [symbol],
        chainId: vault.chainId,
      };
    });
  }

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const symbols = selectVaultTokenSymbols(state, vaultId);
  return [
    {
      key: depositToken.symbol,
      label: depositToken.symbol,
      value: vaultTvl,
      symbols,
      chainId: vault.chainId,
    },
  ];
};
export const selectDashboardUserExposureByToken = (state: BeefyState, walletAddress?: string) =>
  selectDashboardUserExposure(
    state,
    selectDashboardUserVaultTokenExposure,
    entries =>
      getTopNArray(entries, 'percentage', 6, {
        key: 'others',
        label: 'Others',
        value: BIG_ZERO,
        percentage: 0,
        symbols: [],
        chainId: 'ethereum',
      }),
    walletAddress
  );
const selectDashboardUserVaultStableExposure: DashboardUserExposureVaultFn = (
  state,
  vaultId,
  vaultTvl,
  walletAddress
) => {
  if (selectIsVaultStable(state, vaultId)) {
    return [{ key: 'stable', label: 'Stable', value: vaultTvl }];
  }

  const vault = selectVaultById(state, vaultId);
  const haveBreakdownData = selectHasBreakdownDataForVault(state, vault);
  if (haveBreakdownData) {
    const breakdown = selectLpBreakdownForVault(state, vault);
    const { assets } = selectUserLpBreakdownBalance(state, vault, breakdown, walletAddress);
    const scaleFactor = getDashboardLpBreakdownScalingFactor(vaultId, vaultTvl, assets);

    return assets.map(asset => {
      const isStable = selectIsTokenStable(state, asset.chainId, asset.id);
      return {
        key: isStable ? 'stable' : 'other',
        label: isStable ? 'Stable' : 'Other',
        value: asset.userValue.multipliedBy(scaleFactor),
      };
    });
  }

  return [{ key: 'other', label: 'Other', value: vaultTvl }];
};
export const selectDashboardUserStablecoinsExposure = (state: BeefyState, walletAddress: string) =>
  selectDashboardUserExposure(
    state,
    selectDashboardUserVaultStableExposure,
    stableVsOthersSummarizer,
    walletAddress
  );
export const selectDashboardUserVaultsPnl = (state: BeefyState, walletAddress: string) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const vaults: Record<string, UserVaultPnl> = {};
  for (const vaultId of userVaults) {
    vaults[vaultId] = selectVaultPnl(state, vaultId, walletAddress);
  }
  return vaults;
};

export enum DashboardDataStatus {
  Loading,
  Missing,
  Available,
}

function selectDashboardYieldGovData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultGov,
  _pnl: UserGovPnl
) {
  const { totalRewardsUsd } = selectDashboardUserRewardsByVaultId(state, vault.id, walletAddress);
  return { type: vault.type, totalRewardsUsd, hasRewards: totalRewardsUsd.gt(BIG_ZERO) };
}

function selectDashboardYieldStandardData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultStandard,
  pnl: UserStandardPnl
) {
  if (!selectIsAnalyticsLoadedByAddress(state, walletAddress)) {
    return DashboardDataStatus.Loading;
  }

  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vault.id, walletAddress);
  if (!vaultTimeline) {
    return DashboardDataStatus.Missing;
  }

  const { rewards, totalRewardsUsd } = selectDashboardUserRewardsByVaultId(
    state,
    vault.id,
    walletAddress
  );
  const { totalYield, totalYieldUsd, tokenDecimals } = pnl;
  return {
    type: vault.type,
    totalRewardsUsd,
    hasRewards: rewards.length > 0,
    totalYield,
    totalYieldUsd,
    tokenDecimals,
  };
}

function selectDashboardYieldCowcentratedData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultCowcentratedLike,
  pnl: UserClmPnl
) {
  if (
    !selectIsAnalyticsLoadedByAddress(state, walletAddress) ||
    !selectIsClmHarvestsLoadedByAddress(state, walletAddress)
  ) {
    return DashboardDataStatus.Loading;
  }

  const { rewards, totalRewardsUsd } = selectDashboardUserRewardsByVaultId(
    state,
    vault.id,
    walletAddress
  );

  if (isCowcentratedStandardVault(vault)) {
    const underlyingYield = pnl.underlying.diff.amount;
    return {
      type: 'standard' as const,
      totalRewardsUsd,
      hasRewards: rewards.length > 0,
      totalYield: underlyingYield,
      totalYieldUsd: underlyingYield.multipliedBy(pnl.underlying.now.price),
      tokenDecimals: pnl.underlying.token.decimals,
    };
  }

  const tokens = selectCowcentratedLikeVaultDepositTokens(state, vault.id);
  return {
    type: 'cowcentrated' as const,
    tokens: [tokens.token0, tokens.token1] as const,
    yields: pnl.yields,
    totalRewardsUsd,
    hasRewards: rewards.length > 0,
  };
}

export function selectDashboardYieldVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultEntity,
  pnl: UserVaultPnl
) {
  // Common load check
  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return DashboardDataStatus.Loading;
  }

  if (isCowcentratedLikeVault(vault) && isUserClmPnl(pnl)) {
    return selectDashboardYieldCowcentratedData(state, walletAddress, vault, pnl);
  } else if (isGovVault(vault) && isUserGovPnl(pnl)) {
    return selectDashboardYieldGovData(state, walletAddress, vault, pnl);
  } else if (isStandardVault(vault) && isUserStandardPnl(pnl)) {
    return selectDashboardYieldStandardData(state, walletAddress, vault, pnl);
  }

  throw new Error('Invalid vault/pnl type');
}
