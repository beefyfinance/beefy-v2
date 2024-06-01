import BigNumber from 'bignumber.js';
import { BIG_ZERO } from './big-number';
import type { TokenLpBreakdown } from '../features/data/entities/token';
import { isCowcentratedVault, type VaultEntity } from '../features/data/entities/vault';

export function getVaultUnderlyingTvlAndBeefySharePercent(
  vault: VaultEntity,
  breakdown: TokenLpBreakdown,
  beefyTvl: BigNumber
) {
  const underlyingPrice = isCowcentratedVault(vault)
    ? breakdown.underlyingPrice || 0
    : breakdown.price;
  const underlyingLiquidity = isCowcentratedVault(vault)
    ? new BigNumber(breakdown.underlyingLiquidity || 0)
    : new BigNumber(breakdown.totalSupply);
  const underlyingTvl = underlyingLiquidity.times(underlyingPrice);

  if (beefyTvl.gt(underlyingTvl)) {
    return { underlyingTvl: beefyTvl, percent: 1 };
  } else {
    return {
      underlyingTvl,
      percent: underlyingTvl.gt(BIG_ZERO) ? beefyTvl.div(underlyingTvl).toNumber() : 0,
    };
  }
}
