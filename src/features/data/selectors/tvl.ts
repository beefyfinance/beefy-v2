import BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { bigNumberEqual, numberEqual } from '../utils/selector-equality.ts';
import {
  selectLpBreakdownByOracleId,
  selectLpBreakdownForVault,
  selectLpBreakdownForVaultId,
  selectTokenByAddress,
} from './tokens.ts';
import type { TvlBreakdown, TvlBreakdownUnderlying } from './tvl-types.ts';
import { selectVaultById } from './vaults.ts';

export const selectVaultTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.tvl || BIG_ZERO;

/** Vault TVL before any exclusions are subtracted */
export const selectVaultRawTvl = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.biz.tvl.byVaultId[vaultId]?.rawTvl || BIG_ZERO;

/** pure underlying-TVL math, shared by the per-vault cached selector and the max scan */
export function computeUnderlyingTvlUsd(
  vault: VaultEntity,
  breakdown: ReturnType<typeof selectLpBreakdownForVaultId>
): BigNumber {
  if (!breakdown) return BIG_ZERO;

  if (isCowcentratedLikeVault(vault) && 'underlyingPrice' in breakdown) {
    return new BigNumber(breakdown.underlyingLiquidity || 0).times(breakdown.underlyingPrice || 0);
  }

  return new BigNumber(breakdown.totalSupply || 0).times(breakdown.price || 0);
}

export const selectVaultUnderlyingTvlUsd = createCachedSelector(
  selectVaultById,
  selectLpBreakdownForVaultId,
  computeUnderlyingTvlUsd
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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

    // an unknown beefy-wide total drops that row; the underlying figures beside it are still known
    if (!clmBreakdown.totalSupply || !clmBreakdown.price) {
      return {
        vaultTvl,
        vaultShare: calculateShare(vaultTvl, underlyingTvl),
        underlyingTvl,
        underlyingPlatformId: depositToken.providerId,
      };
    }

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

  if (!breakdown.totalSupply || !breakdown.price) {
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
// a breakdown field left uncompared here never updates on screen
export function tvlBreakdownEqual(
  a: TvlBreakdownUnderlying | null | undefined,
  b: TvlBreakdownUnderlying | null | undefined
): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (
    a.underlyingPlatformId !== b.underlyingPlatformId ||
    !numberEqual(a.vaultShare, b.vaultShare) ||
    !bigNumberEqual(a.vaultTvl, b.vaultTvl) ||
    !bigNumberEqual(a.underlyingTvl, b.underlyingTvl)
  ) {
    return false;
  }
  if ('vaultType' in a) {
    return (
      'vaultType' in b &&
      a.vaultType === b.vaultType &&
      a.totalType === b.totalType &&
      numberEqual(a.totalShare, b.totalShare) &&
      bigNumberEqual(a.totalTvl, b.totalTvl)
    );
  }
  return !('vaultType' in b);
}
