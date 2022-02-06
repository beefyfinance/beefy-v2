import { createSelector } from '@reduxjs/toolkit';
import { memoize } from 'lodash';
import { BIG_ZERO, byDecimals } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { ApyData, isGovVaultApy, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { isGovVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import {
  selectBoostUserBalanceInToken,
  selectUserDepositedVaults,
  selectStandardVaultUserBalanceInToken,
  selectGovVaultUserBalance,
} from './balance';
import { selectActiveVaultBoostIds, selectBoostById } from './boosts';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenById, selectTokenPriceByTokenId } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectVaultApyInfos = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.apy.byVaultId[vaultId]],
  (vaultApy): ApyData => {
    if (vaultApy === undefined) {
      return { totalApy: 0 };
    }
    return vaultApy;
  }
);

export const selectGovVaultApr = createSelector(
  (state: BeefyState, vaultId: VaultGov['id']) => state.biz.apy.byVaultId[vaultId],
  vaultApy => {
    if (vaultApy === undefined) {
      return 0;
    }
    if (!isGovVaultApy(vaultApy)) {
      throw new Error('Apy is not a gov vault apy');
    }
    return vaultApy.vaultApr;
  }
);

export const selectStandardVaultTotalApy = createSelector(
  (state: BeefyState, vaultId: VaultStandard['id']) => state.biz.apy.byVaultId[vaultId],
  vaultApy => {
    if (vaultApy === undefined) {
      return 0;
    }
    if (!isStandardVaultApy(vaultApy) && !isMaxiVaultApy(vaultApy)) {
      throw new Error('Apy is not a standard vault apy and not a maxi vault apy');
    }
    return vaultApy.totalApy;
  }
);

export const selectUserGlobalStats = memoize((state: BeefyState) => {
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
    let vaultUsdBalance = BIG_ZERO;
    const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
    if (isGovVault(vault)) {
      const tokenBalance = selectGovVaultUserBalance(state, vault.chainId, vault.id);
      const token = selectTokenById(state, vault.chainId, vault.oracleId);
      const decimaledTokenBalance = byDecimals(tokenBalance, token.decimals);
      const usdBalance = decimaledTokenBalance.times(oraclePrice);
      vaultUsdBalance = vaultUsdBalance.plus(usdBalance);
    } else {
      const mooTokenBalance = selectStandardVaultUserBalanceInToken(state, vault.chainId, vault.id);
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const earnToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);

      const oracleTokenBalance = byDecimals(
        mooTokenBalance.multipliedBy(byDecimals(ppfs)).toFixed(8),
        earnToken.decimals
      );
      const usdBalance = oracleTokenBalance.times(oraclePrice);
      vaultUsdBalance = vaultUsdBalance.plus(usdBalance);
    }

    for (const boostId of selectActiveVaultBoostIds(state, vault.id)) {
      const boost = selectBoostById(state, boostId);
      const mooTokenBalance = selectBoostUserBalanceInToken(state, vault.chainId, boost.id);
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const vaultToken = selectTokenById(state, vault.chainId, vault.oracleId);

      const originalTokenBalance = byDecimals(
        mooTokenBalance.multipliedBy(byDecimals(ppfs)),
        vaultToken.decimals
      );
      const usdBalance = originalTokenBalance.times(oraclePrice);
      vaultUsdBalance = vaultUsdBalance.plus(usdBalance);
    }

    // add vault balance to total
    newGlobalStats.deposited = newGlobalStats.deposited.plus(vaultUsdBalance);

    // compute apy and daily yield
    if (isGovVault(vault)) {
      const apr = selectGovVaultApr(state, vault.id);
      const dailyApr = apr / 365;
      const dailyUsd = vaultUsdBalance.times(dailyApr);

      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    } else {
      const apy = selectStandardVaultTotalApy(state, vault.id);
      const dailyApr = Math.pow(10, Math.log10(apy + 1) / 365) - 1;
      const dailyUsd = vaultUsdBalance.times(dailyApr);
      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    }
  }

  newGlobalStats.monthly = newGlobalStats.daily.times(30);
  return newGlobalStats;
});
