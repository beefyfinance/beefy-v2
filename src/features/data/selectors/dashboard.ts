import { EMPTY_ARRAY } from '../utils/selector-utils.ts';
import { bigNumberEqual, numberEqual } from '../utils/selector-equality.ts';
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import { orderBy } from 'lodash-es';
import type BigNumber from 'bignumber.js';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import {
  isCowcentratedLikeVault,
  isErc4626Vault,
  isGovVault,
  isStandardVault,
  isVaultWithReceipt,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { getTopNArray } from '../utils/array-utils.ts';
import { isUserClmPnl, type PnlYieldSource, type UserVaultPnl } from './analytics-types.ts';
import {
  selectClmPnl,
  selectStandardGovPnl,
  selectUserDepositedTimelineByVaultId,
  selectVaultPnl,
} from './analytics.ts';
import { selectYieldStatsByVaultId } from './apy.ts';
import type { UserLpBreakdownBalanceAsset } from './balance-types.ts';
import {
  selectBoostUserRewardsInToken,
  selectGovVaultPendingRewardsWithPrice,
  selectIsUserBalanceAvailable,
  selectUserDepositedVaultIds,
  selectUserLpBreakdownBalance,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from './balance.ts';
import { selectAllVaultBoostIds } from './boosts.ts';
import { selectChainById } from './chains.ts';
import { selectIsConfigAvailable } from './data-loader/config.ts';
import { selectIsVaultStable } from './filtered-vaults.ts';
import { selectPlatformById } from './platforms.ts';
import {
  selectHasBreakdownDataForVault,
  selectIsTokenStable,
  selectLpBreakdownForVault,
  selectTokenByAddress,
  selectTokenByIdOrUndefined,
  selectTokenPriceByTokenOracleId,
  selectVaultTokenSymbols,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens.ts';
import { selectVaultById } from './vaults.ts';
import { selectWalletAddress, selectWalletAddressIfKnown } from './wallet.ts';
import { selectIsAddressBookLoadedGlobal } from './data-loader/tokens.ts';
import { selectIsAnalyticsLoadedByAddress } from './data-loader/analytics.ts';
import { selectShouldInitDashboardForUserImpl } from './data-loader/dashboard.ts';
import { recordEqualBy } from '../../../helpers/object.ts';

export enum DashboardDataStatus {
  Loading,
  Missing,
  Available,
}

export const selectUserTotalYieldUsd = createSelector(
  (state: BeefyState, walletAddress: string) => selectDashboardUserVaultsPnl(state, walletAddress),
  vaultPnls => {
    let totalYieldUsd = BIG_ZERO;
    for (const vaultPnl of Object.values(vaultPnls)) {
      totalYieldUsd = totalYieldUsd.plus(
        isUserClmPnl(vaultPnl) ? vaultPnl.yields.usd : vaultPnl.totalYieldUsd
      );
    }

    return totalYieldUsd;
  },
  { memoizeOptions: { resultEqualityCheck: (a: BigNumber, b: BigNumber) => a.isEqualTo(b) } }
);

export type UserRewardStatus = 'compounded' | 'pending' | 'claimed';
export type UserRewardSource = PnlYieldSource['source'] | 'gov' | 'boost';

export type UserReward = {
  token: Pick<TokenEntity, 'symbol' | 'decimals' | 'address' | 'chainId'>;
  amount: BigNumber;
  usd: BigNumber;
  status: UserRewardStatus;
  source: UserRewardSource;
};

type UserRewardsStatusEntry = {
  has: boolean;
  usd: BigNumber;
  rewards: UserReward[];
};

export type UserRewards = {
  [status in UserRewardStatus]: UserRewardsStatusEntry;
} & {
  all: UserRewardsStatusEntry;
};

const emptyUserRewardsStatusEntry: UserRewardsStatusEntry = Object.freeze({
  has: false,
  usd: BIG_ZERO,
  rewards: EMPTY_ARRAY,
});
const emptyUserRewards: UserRewards = Object.freeze({
  pending: emptyUserRewardsStatusEntry,
  claimed: emptyUserRewardsStatusEntry,
  compounded: emptyUserRewardsStatusEntry,
  all: emptyUserRewardsStatusEntry,
});
const newUserRewards = (): UserRewards => ({
  pending: { has: false, usd: BIG_ZERO, rewards: [] },
  claimed: { has: false, usd: BIG_ZERO, rewards: [] },
  compounded: { has: false, usd: BIG_ZERO, rewards: [] },
  all: { has: false, usd: BIG_ZERO, rewards: [] },
});

const userRewardsStatusEqual = (a: UserRewardsStatusEntry, b: UserRewardsStatusEntry): boolean =>
  a === b ||
  (a.has === b.has && a.rewards.length === b.rewards.length && bigNumberEqual(a.usd, b.usd));

const userRewardsEqual = (a: UserRewards, b: UserRewards): boolean => {
  if (a === b) {
    return true;
  }
  // reselect's stability check probes result comparators with two fresh empty objects
  if (!a?.all || !b?.all) {
    return false;
  }
  if (
    !userRewardsStatusEqual(a.all, b.all) ||
    !userRewardsStatusEqual(a.pending, b.pending) ||
    !userRewardsStatusEqual(a.claimed, b.claimed) ||
    !userRewardsStatusEqual(a.compounded, b.compounded)
  ) {
    return false;
  }
  // the status buckets hold the same objects as all, so comparing all element-wise settles them too
  return a.all.rewards.every((reward, i) => {
    const other = b.all.rewards[i];
    return (
      reward.status === other.status &&
      reward.source === other.source &&
      reward.token === other.token &&
      bigNumberEqual(reward.amount, other.amount) &&
      bigNumberEqual(reward.usd, other.usd)
    );
  });
};

const selectDashboardUserRewardsByVaultIdUncached = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserRewards => {
  walletAddress = walletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return emptyUserRewards;
  }

  const vault = selectVaultById(state, vaultId);
  const rewards: UserReward[] = [];

  if (isCowcentratedLikeVault(vault)) {
    const pnl = selectClmPnl(state, vaultId, walletAddress);
    for (const type of ['compounded', 'claimed', 'pending'] as const) {
      for (const reward of pnl.yields[type].sources) {
        if (reward.amount.gt(BIG_ZERO)) {
          rewards.push({
            token: reward.token,
            amount: reward.amount,
            usd: reward.usd,
            source: reward.source,
            status: type,
          });
        }
      }
    }
  } else if (isGovVault(vault)) {
    const pendingRewards = selectGovVaultPendingRewardsWithPrice(state, vault.id, walletAddress);
    for (const pendingReward of pendingRewards) {
      if (pendingReward.amount.gt(BIG_ZERO)) {
        const tokenRewardsUsd = pendingReward.amount.times(pendingReward.price || BIG_ZERO);
        rewards.push({
          token: pendingReward.token,
          amount: pendingReward.amount,
          usd: tokenRewardsUsd,
          source: 'gov',
          status: 'pending',
        });
      }
    }
  } else if (isStandardVault(vault) || isErc4626Vault(vault)) {
    const pnl = selectStandardGovPnl(state, vaultId, walletAddress);
    if (pnl.totalYield.gt(BIG_ZERO)) {
      rewards.push({
        token: selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress),
        amount: pnl.totalYield,
        usd: pnl.totalYieldUsd,
        source: 'vault',
        status: 'compounded',
      });
    }
  }

  if (isVaultWithReceipt(vault)) {
    const boosts = selectAllVaultBoostIds(state, vaultId);
    for (const boostId of boosts) {
      const boostRewards = selectBoostUserRewardsInToken(state, boostId, walletAddress) || [];
      for (const boostReward of boostRewards) {
        if (boostReward.amount.isGreaterThan(BIG_ZERO)) {
          const rewardToken = selectTokenByAddress(
            state,
            boostReward.token.chainId,
            boostReward.token.address
          );
          const oraclePrice = selectTokenPriceByTokenOracleId(state, rewardToken.oracleId);
          const tokenRewardsUsd = boostReward.amount.times(oraclePrice);

          rewards.push({
            token: rewardToken,
            amount: boostReward.amount,
            usd: tokenRewardsUsd,
            source: 'boost',
            status: 'pending',
          });
        }
      }
    }
  }

  if (!rewards.length) {
    return emptyUserRewards;
  }

  return rewards.reduce<UserRewards>((acc, reward) => {
    for (const key of ['all', reward.status] as const) {
      const status = acc[key];
      status.has = true;
      status.usd = status.usd.plus(reward.usd);
      status.rewards.push(reward);
    }
    return acc;
  }, newUserRewards());
};

// TODO add more checks
const selectDashboardYieldRewardDataAvailableByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
): DashboardDataStatus => {
  const walletAddress = maybeWalletAddress || selectWalletAddressIfKnown(state);
  if (!walletAddress) {
    return DashboardDataStatus.Missing;
  }

  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return DashboardDataStatus.Loading;
  }

  const vault = selectVaultById(state, vaultId);
  if (isCowcentratedLikeVault(vault) || isStandardVault(vault) || isErc4626Vault(vault)) {
    if (!selectIsAnalyticsLoadedByAddress(state, walletAddress)) {
      return DashboardDataStatus.Loading;
    }

    if (isCowcentratedLikeVault(vault) && !selectHasBreakdownDataForVault(state, vault)) {
      // CLM Yield is from CLM Pnl which needs the LP breakdown
      return DashboardDataStatus.Missing;
    }

    const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
    if (!vaultTimeline) {
      return DashboardDataStatus.Missing;
    }

    return DashboardDataStatus.Available;
  }

  if (isGovVault(vault)) {
    return DashboardDataStatus.Available;
  }

  return DashboardDataStatus.Missing;
};

export const selectDashboardUserRewardsOrStatusByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserRewards | Exclude<DashboardDataStatus, DashboardDataStatus.Available> => {
  const status = selectDashboardYieldRewardDataAvailableByVaultId(state, vaultId, walletAddress);
  if (status === DashboardDataStatus.Available) {
    return selectDashboardUserRewardsByVaultId(state, vaultId, walletAddress);
  }
  return status;
};

type DashboardUserExposureVaultEntry = {
  key: string;
  label: string;
  value: BigNumber;
};

type DashboardUserExposureVaultFn<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  vaultTvl: BigNumber,
  walletAddress: string
) => T[];

type DashboardUserExposureEntry<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
> = T & {
  percentage: number;
};

type DashboardUserExposureSummarizer<
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
> = (entries: DashboardUserExposureEntry<T>[]) => DashboardUserExposureEntry<T>[];

type DashboardUserTokenExposureVaultEntry = DashboardUserExposureVaultEntry & {
  symbols: string[];
  chainId: ChainEntity['id'];
};

type DashboardUserChainExposureVaultEntry = DashboardUserExposureVaultEntry & {
  chainId: ChainEntity['id'] | 'others';
};
type DashboardUserAnyExposureEntry = DashboardUserExposureEntry & {
  chainId?: ChainEntity['id'] | 'others';
  symbols?: string[];
};

const exposureSymbolsEqual = (a: string[] | undefined, b: string[] | undefined): boolean => {
  if (a === b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  return a.every((symbol, i) => symbol === b[i]);
};

export const exposureEntriesEqual = (
  a: DashboardUserAnyExposureEntry[],
  b: DashboardUserAnyExposureEntry[]
): boolean => {
  if (a === b) {
    return true;
  }
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((entry, i) => {
    const other = b[i];
    return (
      entry.key === other.key &&
      entry.label === other.label &&
      numberEqual(entry.percentage, other.percentage) &&
      entry.chainId === other.chainId &&
      bigNumberEqual(entry.value, other.value) &&
      exposureSymbolsEqual(entry.symbols, other.symbols)
    );
  });
};

const getDashboardLpBreakdownScalingFactor = (
  _vaultId: string,
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
const EXPOSURE_OTHERS: DashboardUserExposureEntry = Object.freeze({
  key: 'others',
  label: 'Others',
  value: BIG_ZERO,
  percentage: 0,
});
const CHAIN_EXPOSURE_OTHERS: DashboardUserExposureEntry<DashboardUserChainExposureVaultEntry> =
  Object.freeze({
    ...EXPOSURE_OTHERS,
    chainId: 'others' as const,
  });
const TOKEN_EXPOSURE_OTHERS: DashboardUserExposureEntry<DashboardUserTokenExposureVaultEntry> =
  Object.freeze({
    ...EXPOSURE_OTHERS,
    symbols: EMPTY_ARRAY,
    chainId: 'ethereum' as const,
  });
const top6ByPercentageSummarizer = <
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
>(
  entries: DashboardUserExposureEntry<T>[]
) => getTopNArray(entries, 'percentage', 6, EXPOSURE_OTHERS);
const top6ChainsByPercentageSummarizer = (
  entries: DashboardUserExposureEntry<DashboardUserChainExposureVaultEntry>[]
) => getTopNArray(entries, 'percentage', 6, CHAIN_EXPOSURE_OTHERS);
const top6TokensByPercentageSummarizer = (
  entries: DashboardUserExposureEntry<DashboardUserTokenExposureVaultEntry>[]
) => getTopNArray(entries, 'percentage', 6, TOKEN_EXPOSURE_OTHERS);
const stableVsOthersSummarizer = (entries: DashboardUserExposureEntry[]) =>
  orderBy(entries, 'key', 'desc');

const selectDashboardUserExposure = <
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
>(
  state: BeefyState,
  vaultFn: DashboardUserExposureVaultFn<T>,
  summarizerFn: DashboardUserExposureSummarizer<T>,
  maybeWalletAddress?: string
): DashboardUserExposureEntry<T>[] => {
  const walletAddress = maybeWalletAddress || selectWalletAddressIfKnown(state);
  if (!walletAddress) {
    return EMPTY_ARRAY;
  }

  const vaultIds = selectUserDepositedVaultIds(state, walletAddress);
  if (!vaultIds.length) {
    return EMPTY_ARRAY;
  }

  const vaultDeposits = vaultIds.map(vaultId =>
    selectUserVaultBalanceInUsdIncludingDisplaced(state, vaultId, walletAddress)
  );
  const totalDeposits = vaultDeposits.reduce((acc, deposit) => acc.plus(deposit), BIG_ZERO);
  const entries = vaultIds
    .map((vaultId, i) => vaultFn(state, vaultId, vaultDeposits[i], walletAddress))
    .flat();
  const byKey = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.key]) {
        acc[entry.key] = entry;
      } else {
        acc[entry.key].value = acc[entry.key].value.plus(entry.value);
      }
      return acc;
    },
    {} as Record<DashboardUserExposureVaultEntry['key'], T>
  );

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
    top6ChainsByPercentageSummarizer,
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
    top6TokensByPercentageSummarizer,
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

export const selectDashboardUserVaultsPnl = createSelector(
  // @dev we were recalculating on every state change anyway - this lets us use resultEqualityCheck
  (state: BeefyState, _walletAddress: string) => state,
  (_state: BeefyState, walletAddress: string) => walletAddress,
  (state, walletAddress) => {
    const userVaults = selectUserDepositedVaultIds(state, walletAddress);
    const vaults: Record<string, UserVaultPnl> = {};
    for (const vaultId of userVaults) {
      vaults[vaultId] = selectVaultPnl(state, vaultId, walletAddress);
    }
    return vaults;
  },
  {
    memoizeOptions: { resultEqualityCheck: recordEqualBy<UserVaultPnl>((a, b) => a === b) },
  }
);

export const selectDashboardUserVaultsDailyYield = createSelector(
  // @dev we were recalculating on every state change anyway - this lets us use resultEqualityCheck
  (state: BeefyState, _walletAddress: string) => state,
  (_state: BeefyState, walletAddress: string) => walletAddress,
  (state, walletAddress) => {
    const userVaults = selectUserDepositedVaultIds(state, walletAddress);
    const vaults: Record<string, BigNumber> = {};
    for (const vaultId of userVaults) {
      const { dailyUsd } = selectYieldStatsByVaultId(state, vaultId, walletAddress);
      vaults[vaultId] = dailyUsd;
    }
    return vaults;
  },
  {
    memoizeOptions: { resultEqualityCheck: recordEqualBy<BigNumber>((a, b) => a.isEqualTo(b)) },
  }
);

export const selectShouldInitDashboardForUser = (state: BeefyState, walletAddress: string) => {
  if (!walletAddress) {
    return false;
  }

  return (
    selectIsConfigAvailable(state) &&
    selectIsAddressBookLoadedGlobal(state) &&
    selectShouldInitDashboardForUserImpl(state, walletAddress)
  );
};

/** @dev requires analytics timeline / user pnl to be loaded */
export const selectDashboardUserRewardsByVaultId = createCachedSelector(
  (state: BeefyState) => state,
  (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (_state: BeefyState, _vaultId: VaultEntity['id'], walletAddress?: string) => walletAddress,
  selectDashboardUserRewardsByVaultIdUncached,
  { memoizeOptions: { resultEqualityCheck: userRewardsEqual } }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    `${vaultId}-${walletAddress ?? ''}`
);
