import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { byDecimals } from '../../../helpers/format';
import { BeefyState } from '../../redux/reducers/storev2';
import { ApyData, isGovVaultApy, isStandardVaultApy } from '../apis/beefy';
import { isGovVault, VaultEntity } from '../entities/vault';
import {
  selectBoostUserBalanceInToken,
  selectUserDepositedVaults,
  selectStandardVaultUserBalanceInToken,
  selectGovVaultUserBalance,
} from './balance';
import { selectActiveVaultBoostId, selectBoostById, selectIsVaultBoosted } from './boosts';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenById, selectTokenPriceByTokenId } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectVaultApyInfos = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.apy.byVaultId[vaultId]],
  (vaultApy): ApyData | number => {
    if (vaultApy === undefined) {
      return 0;
    }
    return vaultApy;
  }
);

export const selectGovVaultApr = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.apy.byVaultId[vaultId]],
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

export const selectStandardVaultApy = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.biz.apy.byVaultId[vaultId]],
  vaultApy => {
    if (vaultApy === undefined) {
      return 0;
    }
    if (!isStandardVaultApy(vaultApy)) {
      throw new Error('Apy is not a standard vault apy');
    }
    return vaultApy.vaultApy;
  }
);

export function selectUserGlobalStats(state: BeefyState) {
  let newGlobalStats = {
    deposited: new BigNumber(0),
    totalYield: new BigNumber(0),
    daily: new BigNumber(0),
    monthly: new BigNumber(0),
  };

  // while loading all necessary data, return 0
  if (!selectIsUserBalanceAvailable(state)) {
    return newGlobalStats;
  }

  const userVaults = selectUserDepositedVaults(state).map(vaultId =>
    selectVaultById(state, vaultId)
  );
  if (userVaults.length > 0) {
    debugger;
  }

  for (const vault of userVaults) {
    let vaultUsdBalance = new BigNumber(0);
    const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
    if (isGovVault(vault)) {
      const tokenBalance = selectGovVaultUserBalance(state, vault.chainId, vault.id);
      const usdBalance = tokenBalance.times(oraclePrice);
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

    if (selectIsVaultBoosted(state, vault.id)) {
      const boost = selectBoostById(state, selectActiveVaultBoostId(state, vault.id));
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
      const dailyUsd = vaultUsdBalance.times(dailyApr).times(oraclePrice);

      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    } else {
      const apy = selectStandardVaultApy(state, vault.id);
      const dailyApr = Math.pow(10, Math.log10(apy + 1) / 365) - 1;
      const dailyUsd = vaultUsdBalance.times(dailyApr).times(oraclePrice);
      newGlobalStats.daily = newGlobalStats.daily.plus(dailyUsd);
    }
  }

  newGlobalStats.monthly = newGlobalStats.daily.times(30);
  return newGlobalStats;
}
