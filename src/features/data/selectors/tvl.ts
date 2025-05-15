import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import {
  selectLpBreakdownByOracleId,
  selectLpBreakdownForVault,
  selectTokenByAddress,
} from './tokens.ts';
import type { TvlBreakdown } from './tvl-types.ts';
import { selectVaultById } from './vaults.ts';

export const selectVaultTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.tvl || BIG_ZERO;

/** Vault TVL before any exclusions are subtracted */
export const selectVaultRawTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.rawTvl || BIG_ZERO;

export const selectVaultUnderlyingTvlUsd = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  const breakdown = selectLpBreakdownForVault(state, vault);
  if (!breakdown) return BIG_ZERO;

  if (isCowcentratedLikeVault(vault) && 'underlyingPrice' in breakdown) {
    return new BigNumber(breakdown.underlyingLiquidity || 0).times(breakdown.underlyingPrice || 0);
  }

  return new BigNumber(breakdown.totalSupply || 0).times(breakdown.price || 0);
};

export const selectTotalTvl = (state: BeefyState) => state.biz.tvl.totalTvl;

export const selectTvlByChain = (state: BeefyState) => state.biz.tvl.byChaindId;

function calculateShare(beefyTvl: BigNumber, underlyingTvl: BigNumber): number {
  return Math.min(underlyingTvl.gt(BIG_ZERO) ? beefyTvl.div(underlyingTvl).toNumber() : 0, 1);
}

export const selectTvlBreakdownByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): TvlBreakdown => {
  const vault = selectVaultById(state, vaultId);
  const isClmLike = isCowcentratedLikeVault(vault);
  const vaultTvl = selectVaultTvl(state, vault.id);

  // CLM with a pool or vault
  if (isClmLike) {
    // all CLM-like deposit tokens should have the same oracleId
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const clmBreakdown = selectLpBreakdownByOracleId(state, depositToken.oracleId);
    if (
      !clmBreakdown ||
      !('underlyingPrice' in clmBreakdown) ||
      !clmBreakdown.underlyingPrice ||
      !clmBreakdown.underlyingLiquidity
    ) {
      return { vaultTvl };
    }

    const underlyingTvl = new BigNumber(clmBreakdown.underlyingLiquidity).times(
      clmBreakdown.underlyingPrice
    );

    const totalTvl = new BigNumber(clmBreakdown.totalSupply).times(clmBreakdown.price);

    // If all the Beefy TVL is in this vault, we can skip further breakdown
    if (totalTvl.minus(vaultTvl).lt(0.1)) {
      return {
        vaultTvl,
        vaultShare: calculateShare(vaultTvl, underlyingTvl),
        underlyingTvl,
        underlyingPlatformId: depositToken.providerId,
      };
    }

    return {
      vaultType: isCowcentratedVault(vault) ? 'cowcentrated' : `cowcentrated-${vault.type}`,
      vaultTvl,
      vaultShare: calculateShare(vaultTvl, underlyingTvl),
      totalType: 'cowcentrated',
      totalTvl,
      totalShare: calculateShare(totalTvl, underlyingTvl),
      underlyingTvl,
      underlyingPlatformId: depositToken.providerId,
    };
  }

  const breakdown = selectLpBreakdownForVault(state, vault);
  if (!breakdown) {
    return { vaultTvl };
  }

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const underlyingTvl = new BigNumber(breakdown.totalSupply).times(breakdown.price);
  return {
    vaultTvl,
    vaultShare: calculateShare(vaultTvl, underlyingTvl),
    underlyingTvl,
    underlyingPlatformId: depositToken.providerId,
  };
};
