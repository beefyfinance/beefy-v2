import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { isGovVault, isVaultActive } from '../entities/vault';
import {
  selectAddressDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
} from './balance';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectUserActiveBoostBalanceInToken } from './boosts';
import type { TotalApy } from '../reducers/apy';
import { isEmpty } from '../../../helpers/utils';
import { selectWalletAddress } from './wallet';
import { BigNumber } from 'bignumber.js';

const EMPTY_TOTAL_APY: TotalApy = {
  totalApy: 0,
  totalMonthly: 0,
  totalDaily: 0,
};

export const selectVaultTotalApy = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const result = state.biz.apy.totalApy.byVaultId[vaultId] || { ...EMPTY_TOTAL_APY };
  return result;
};

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

const EMPTY_GLOBAL_STATS = {
  deposited: 0,
  daily: 0,
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

  const userVaultIds = selectAddressDepositedVaultIds(state, walletAddress);

  if (userVaultIds.length === 0) {
    return EMPTY_GLOBAL_STATS;
  }

  const newGlobalStats = {
    ...EMPTY_GLOBAL_STATS,
    depositedVaults: userVaultIds.length,
  };

  const userVaults = userVaultIds.map(vaultId => selectVaultById(state, vaultId));

  for (const vault of userVaults) {
    const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
      state,
      vault.id,
      walletAddress
    );

    if (tokenBalance.lte(BIG_ZERO)) {
      continue;
    }

    const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    const vaultUsdBalance = tokenBalance.times(oraclePrice).toNumber();

    // Add vault balance to total
    newGlobalStats.deposited += vaultUsdBalance;

    if (!isVaultActive(vault) || vaultUsdBalance <= 0) {
      continue;
    }

    // Add period totals for each vault
    const apyData = selectVaultTotalApy(state, vault.id);

    if (isEmpty(apyData)) {
      continue;
    }

    newGlobalStats.daily += vaultUsdBalance * apyData.totalDaily;
    newGlobalStats.monthly += vaultUsdBalance * apyData.totalMonthly;
    newGlobalStats.yearly += vaultUsdBalance * apyData.totalApy;
  }

  // Skip yield calc if user has no deposits
  if (newGlobalStats.deposited <= 0) {
    return newGlobalStats;
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly / newGlobalStats.deposited;

  return newGlobalStats;
};

export const selectVaultDailyYieldStats = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  if (!isVaultActive(vault)) {
    return {
      dailyUsd: BIG_ZERO,
      dailyTokens: BIG_ZERO,
      oraclePrice,
      tokenDecimals: depositToken.decimals,
    };
  }

  const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vault.id,
    walletAddress
  );
  const vaultUsdBalance = tokenBalance.times(oraclePrice);
  const apyData = selectVaultTotalApy(state, vault.id);

  let dailyUsd: BigNumber;
  let dailyTokens: BigNumber;

  if (isGovVault(vault)) {
    dailyUsd = vaultUsdBalance.times(apyData.totalDaily);
    dailyTokens = tokenBalance.times(apyData.totalDaily);
  } else {
    const ppfs = selectVaultPricePerFullShare(state, vaultId);
    const boostBalance = selectUserActiveBoostBalanceInToken(state, vaultId, walletAddress)
      .multipliedBy(ppfs)
      .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
    const boostBalanceUsd = boostBalance.times(oraclePrice);

    const nonBoostBalanceInTokens = tokenBalance.minus(boostBalance);
    const nonBoostBalanceInUsd = nonBoostBalanceInTokens.times(oraclePrice);

    dailyUsd = nonBoostBalanceInUsd.times(apyData.totalDaily);
    dailyTokens = nonBoostBalanceInTokens.times(apyData.totalDaily);

    if (apyData.boostedTotalDaily !== undefined && boostBalance.gt(BIG_ZERO)) {
      dailyUsd = dailyUsd.plus(boostBalanceUsd.times(apyData.boostedTotalDaily));
      dailyTokens = dailyTokens.plus(boostBalance.times(apyData.boostedTotalDaily));
    }
  }

  return { dailyUsd, dailyTokens, oraclePrice, tokenDecimals: depositToken.decimals };
};
