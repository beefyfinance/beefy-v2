import { memoize } from 'lodash';
import { BIG_ZERO } from '../../../helpers/format';
import { mooAmountToOracleAmount } from '../../../helpers/ppfs';
import { BeefyState } from '../../../redux-types';
import { isGovVaultApy, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { BoostEntity } from '../entities/boost';
import { isGovVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import {
  selectBoostUserBalanceInToken,
  selectUserDepositedVaults,
  selectUserVaultDepositInToken,
} from './balance';
import { selectAllVaultBoostIds, selectBoostById } from './boosts';
import { selectIsUserBalanceAvailable } from './data-loader';
import { selectTokenById, selectTokenPriceByTokenId } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectBoostAprInfos = (state: BeefyState, boostId: BoostEntity['id']) =>
  state.biz.apy.byBoostId[boostId] || { apr: 0 };

export const selectVaultApyInfos = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.apy.byVaultId[vaultId] || { totalApy: 0 };

export const selectGovVaultApr = (state: BeefyState, vaultId: VaultGov['id']) => {
  const vaultApy = state.biz.apy.byVaultId[vaultId];
  if (vaultApy === undefined) {
    return 0;
  }
  if (!isGovVaultApy(vaultApy)) {
    throw new Error('Apy is not a gov vault apy');
  }
  return vaultApy.vaultApr;
};

export const selectStandardVaultTotalApy = (state: BeefyState, vaultId: VaultStandard['id']) => {
  const vaultApy = state.biz.apy.byVaultId[vaultId];
  if (vaultApy === undefined) {
    return 0;
  }
  if (!isStandardVaultApy(vaultApy) && !isMaxiVaultApy(vaultApy)) {
    throw new Error('Apy is not a standard vault apy and not a maxi vault apy');
  }
  return vaultApy.totalApy;
};

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
    const tokenBalance = selectUserVaultDepositInToken(state, vault.id);
    const usdBalance = tokenBalance.times(oraclePrice);
    vaultUsdBalance = vaultUsdBalance.plus(usdBalance);

    for (const boostId of selectAllVaultBoostIds(state, vault.id)) {
      const boost = selectBoostById(state, boostId);
      const mooTokenBalance = selectBoostUserBalanceInToken(state, boost.id);
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
      const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
      const originalTokenBalance = mooAmountToOracleAmount(
        mooToken,
        oracleToken,
        ppfs,
        mooTokenBalance
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
