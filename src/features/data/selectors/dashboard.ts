import type BigNumber from 'bignumber.js';
import { cloneDeep, orderBy } from 'lodash-es';
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
  selectIsAnalyticsLoadedByAddress,
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
import { selectIsConfigAvailable } from './config.ts';
import {
  createAddressChainDataSelector,
  createAddressDataSelector,
  hasLoaderFulfilledRecently,
  isLoaderPending,
  shouldLoaderLoadRecent,
} from './data-loader-helpers.ts';
import { selectIsVaultStable } from './filtered-vaults.ts';
import { selectPlatformById } from './platforms.ts';
import {
  selectHasBreakdownDataForVault,
  selectIsAddressBookLoadedGlobal,
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

export enum DashboardDataStatus {
  Loading,
  Missing,
  Available,
}

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

const emptyUserRewardsStatusEntry: UserRewardsStatusEntry = {
  has: false,
  usd: BIG_ZERO,
  rewards: [],
};
const emptyUserRewards: UserRewards = {
  pending: cloneDeep(emptyUserRewardsStatusEntry),
  claimed: cloneDeep(emptyUserRewardsStatusEntry),
  compounded: cloneDeep(emptyUserRewardsStatusEntry),
  all: cloneDeep(emptyUserRewardsStatusEntry),
};

/**
 * @dev requires analytics timeline / user pnl to be loaded
 */
export const selectDashboardUserRewardsByVaultId = (
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

  return rewards.reduce<UserRewards>((acc, reward) => {
    for (const key of ['all', reward.status] as const) {
      const status = acc[key];
      status.has = true;
      status.usd = status.usd.plus(reward.usd);
      status.rewards.push(reward);
    }
    return acc;
  }, cloneDeep(emptyUserRewards));
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
const top6ByPercentageSummarizer = <
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
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
  T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry,
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

export const selectDashboardUserVaultsDailyYield = (state: BeefyState, walletAddress: string) => {
  const userVaults = selectUserDepositedVaultIds(state, walletAddress);
  const vaults: Record<string, BigNumber> = {};
  for (const vaultId of userVaults) {
    const { dailyUsd } = selectYieldStatsByVaultId(state, vaultId, walletAddress);
    vaults[vaultId] = dailyUsd;
  }
  return vaults;
};
export const selectIsClmHarvestsForUserChainPending = createAddressChainDataSelector(
  'clmHarvests',
  isLoaderPending
);
export const selectIsClmHarvestsForUserPending = createAddressDataSelector(
  'clmHarvests',
  isLoaderPending
);
export const selectIsWalletTimelineForUserPending = createAddressDataSelector(
  'timeline',
  isLoaderPending
);
export const selectIsWalletTimelineForUserRecent = createAddressDataSelector(
  'timeline',
  hasLoaderFulfilledRecently,
  5
);
const selectShouldInitDashboardForUserImpl = createAddressDataSelector(
  'dashboard',
  shouldLoaderLoadRecent,
  5
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
export const selectDashboardShouldLoadBalanceForChainUser = createAddressChainDataSelector(
  'balance',
  shouldLoaderLoadRecent,
  5
);
