import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { isGovVaultApy, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { isGovVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import {
  selectGovVaultUserStackedBalanceInOracleToken,
  selectStandardVaultUserBalanceInOracleTokenIncludingBoosts,
  selectUserDepositedVaults,
} from './balance';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenPriceByTokenId } from './tokens';
import { selectVaultById } from './vaults';

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

const selectStandardVaultRawTotalApy = (state: BeefyState, vaultId: VaultStandard['id']) => {
  const vaultApy = state.biz.apy.rawApy.byVaultId[vaultId];
  if (vaultApy === undefined) {
    return 0;
  }
  if (!isStandardVaultApy(vaultApy) && !isMaxiVaultApy(vaultApy)) {
    throw new Error('Apy is not a standard vault apy and not a maxi vault apy');
  }
  return vaultApy.totalApy;
};

export const selectVaultTotalApy = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] || {};
};

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

export const selectUserGlobalStats = (state: BeefyState) => {
  let newGlobalStats = {
    deposited: BIG_ZERO,
    totalYield: BIG_ZERO,
    daily: BIG_ZERO,
    monthly: BIG_ZERO,
  };

  // while loading all necessary data, return 0
  if (!selectIsUserBalanceAvailable(state)) {
    return newGlobalStats;
  }

  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );

  for (const vault of userVaults) {
    const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
    // TODO: this looks suspisciously wrong for gov vaults
    const tokenBalance = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInOracleToken(state, vault.id)
      : selectStandardVaultUserBalanceInOracleTokenIncludingBoosts(state, vault.id);
    const vaultUsdBalance = tokenBalance.times(oraclePrice);

    // add vault balance to total
    newGlobalStats.deposited = newGlobalStats.deposited.plus(vaultUsdBalance);

    // compute apy and daily yield
    if (isGovVault(vault)) {
      const apr = selectGovVaultRawApr(state, vault.id);
      const dailyApr = apr / 365;
      const dailyUsd = vaultUsdBalance.times(dailyApr);

      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    } else {
      const apy = selectStandardVaultRawTotalApy(state, vault.id);
      const dailyApr = Math.pow(10, Math.log10(apy + 1) / 365) - 1;
      const dailyUsd = vaultUsdBalance.times(dailyApr);
      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    }
  }
  newGlobalStats.monthly = newGlobalStats.daily.times(30);
  return newGlobalStats;
};
