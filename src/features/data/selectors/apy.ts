import { BeefyState } from '../../../redux-types';
import { isGovVault, isVaultActive, VaultEntity } from '../entities/vault';
import {
  selectAddressDepositedVaultIds,
  selectGovVaultUserStakedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserVaultDepositInDepositToken,
} from './balance';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenPriceByAddress } from './tokens';
import { selectVaultById } from './vaults';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectUserActiveBoostBalanceInToken } from './boosts';
import { selectWalletAddressIfKnown } from './wallet';
import { TotalApy } from '../reducers/apy';
import { compoundInterest } from '../../../helpers/number';

export const selectVaultTotalApy = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] || {};
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
export const selectUserGlobalStats = (state: BeefyState) => {
  const walletAddress = selectWalletAddressIfKnown(state);
  if (!walletAddress) {
    return EMPTY_GLOBAL_STATS;
  }

  if (!selectIsUserBalanceAvailable(state)) {
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
    const tokenBalance = isGovVault(vault)
      ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);

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

    // Collect yield for each vault
    const apyData = selectVaultTotalApy(state, vault.id);

    if (isGovVault(vault)) {
      newGlobalStats.daily += vaultUsdBalance * apyData.totalDaily;
      newGlobalStats.monthly += vaultUsdBalance * apyData.totalDaily * 30;
      newGlobalStats.yearly += vaultUsdBalance * apyData.totalApy;
    } else {
      const nonCompoundableComponents: (keyof TotalApy)[] = [
        'tradingDaily',
        'composablePoolDaily',
        'liquidStakingDaily',
      ];
      // if none of the breakdown is available, we assume totalApy is 100% vault earnings (=compoundable)
      const useBreakdown =
        apyData.vaultDaily ||
        apyData.tradingDaily ||
        apyData.composablePoolDaily ||
        apyData.liquidStakingApr;
      const vaultDaily = useBreakdown ? apyData.vaultDaily || 0 : apyData.totalDaily;

      // non-compoundable components
      let totalNonCompoundableDaily = 0;
      for (const key of nonCompoundableComponents) {
        const daily = key in apyData ? apyData[key] || 0 : 0;
        if (daily > 0) {
          totalNonCompoundableDaily += daily;
        }
      }

      // compoundable components
      let totalCompoundableDaily = vaultDaily;

      // total
      newGlobalStats.daily +=
        vaultUsdBalance * (totalNonCompoundableDaily + totalCompoundableDaily);
      newGlobalStats.monthly +=
        vaultUsdBalance * totalNonCompoundableDaily * 30 +
        compoundInterest(totalCompoundableDaily, vaultUsdBalance, 1, 30);
      newGlobalStats.yearly += vaultUsdBalance * apyData.totalApy;
    }
  }

  // Skip yield calc if user has no deposits
  if (newGlobalStats.deposited <= 0) {
    return newGlobalStats;
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly / newGlobalStats.deposited;

  return newGlobalStats;
};

export const selectVaultDailyYieldStats = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const tokenBalance = selectUserVaultDepositInDepositToken(state, vault.id);
  const vaultUsdBalance = tokenBalance.times(oraclePrice);
  const apyData = selectVaultTotalApy(state, vault.id);

  let dailyUsd = BIG_ZERO;
  let dailyTokens = BIG_ZERO;

  if (isGovVault(vault)) {
    dailyUsd = vaultUsdBalance.times(apyData.totalDaily);
    dailyTokens = tokenBalance.times(apyData.totalDaily);
  } else {
    const boostBalance = selectUserActiveBoostBalanceInToken(state, vaultId);
    const nonBoostBalanceInTokens = tokenBalance.minus(boostBalance);
    const nonBoostBalanceInUsd = nonBoostBalanceInTokens.times(oraclePrice);

    dailyUsd = nonBoostBalanceInUsd.times(apyData.totalDaily);
    dailyTokens = nonBoostBalanceInTokens.times(apyData.totalDaily);

    if ('boostedTotalDaily' in apyData && boostBalance.gt(BIG_ZERO)) {
      dailyUsd = dailyUsd.plus(tokenBalance.times(apyData.boostedTotalDaily));
      dailyTokens = dailyUsd.plus(vaultUsdBalance.times(apyData.boostedTotalDaily));
    }
  }

  return { dailyUsd, dailyTokens };
};
