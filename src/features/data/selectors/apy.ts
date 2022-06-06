import { BeefyState } from '../../../redux-types';
import { ApyStandard, isGovVaultApy } from '../apis/beefy';
import { isGovVault, isVaultActive, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserDepositedVaults,
} from './balance';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenPriceByAddress } from './tokens';
import { selectVaultById } from './vaults';
import { BIG_ZERO, compound } from '../../../helpers/big-number';

const selectGovVaultRawApr = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vaultApy = state.biz.apy.rawApy.byVaultId[vaultId];
  if (vaultApy === undefined) {
    return 0;
  }
  if (!isGovVaultApy(vaultApy)) {
    throw new Error('Apy is not a gov vault apy');
  }
  return vaultApy.vaultApr;
};

const selectStandardVaultRawApy = (
  state: BeefyState,
  vaultId: VaultStandard['id']
): Partial<ApyStandard> => {
  const apyData = state.biz.apy.rawApy.byVaultId[vaultId];
  if (apyData === undefined) {
    return { totalApy: 0 };
  }
  return apyData;
};

export const selectVaultTotalApy = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] || {};
};

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

export const selectUserGlobalStats = (state: BeefyState) => {
  const newGlobalStats = {
    deposited: BIG_ZERO,
    daily: BIG_ZERO,
    monthly: BIG_ZERO,
    yearly: BIG_ZERO,
    apy: BIG_ZERO,
  };

  // while loading all necessary data, return 0
  if (!selectIsUserBalanceAvailable(state)) {
    return newGlobalStats;
  }

  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  const dailyYield = [];

  for (const vault of userVaults) {
    const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    const tokenBalance = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const vaultUsdBalance = tokenBalance.times(oraclePrice);

    // Add vault balance to total
    newGlobalStats.deposited = newGlobalStats.deposited.plus(vaultUsdBalance);

    // Skip non-active/empty vaults for yields
    if (!isVaultActive(vault) || vaultUsdBalance.lte(BIG_ZERO)) {
      continue;
    }

    // Collect yield for each vault
    if (isGovVault(vault)) {
      const apr = selectGovVaultRawApr(state, vault.id);

      dailyYield.push({
        id: vault.id,
        deposit: vaultUsdBalance,
        rate: apr / 365,
        compoundable: false,
      });
    } else {
      const apyData = selectStandardVaultRawApy(state, vault.id);
      // If no tradingApr returned from API, we assume there is no trading component
      const tradingApr = 'tradingApr' in apyData ? apyData.tradingApr || 0 : 0;
      // If no vaultApr returned from API, we assume totalApy is all from vault, and not trading
      const vaultApr =
        'vaultApr' in apyData
          ? apyData.vaultApr || 0
          : (Math.pow((apyData.totalApy || 0) + 1, 1 / 365) - 1) * 365;

      // Trading APR is not compoundable
      if (tradingApr > 0) {
        dailyYield.push({
          id: vault.id,
          deposit: vaultUsdBalance,
          rate: tradingApr / 365,
          compoundable: false,
        });
      }

      // Vault APR is compoundable
      if (vaultApr > 0) {
        dailyYield.push({
          id: vault.id,
          deposit: vaultUsdBalance,
          rate: vaultApr / 365,
          compoundable: true,
        });
      }
    }
  }

  // Skip yield calc if user has no deposits
  if (!newGlobalStats.deposited.gt(BIG_ZERO)) {
    return newGlobalStats;
  }

  // Compute yield
  for (const entry of dailyYield) {
    const daily = entry.deposit.times(entry.rate);
    const monthly = entry.compoundable
      ? compound(entry.rate, entry.deposit, 1, 30)
      : entry.deposit.times(entry.rate).times(30);
    const yearly = entry.compoundable
      ? compound(entry.rate, entry.deposit, 1, 365)
      : entry.deposit.times(entry.rate).times(365);

    newGlobalStats.daily = newGlobalStats.daily.plus(daily);
    newGlobalStats.monthly = newGlobalStats.monthly.plus(monthly);
    newGlobalStats.yearly = newGlobalStats.yearly.plus(yearly);
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly.dividedBy(newGlobalStats.deposited);

  return newGlobalStats;
};
