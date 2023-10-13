import BigNumber from 'bignumber.js';
import { BIG_ZERO } from './big-number';

export function getVaultUnderlyingTvlAndBeefySharePercent(
  totalSupply: string,
  price: number,
  beefyTvl: BigNumber
) {
  const underlyingTvl = new BigNumber(totalSupply).times(price);

  if (beefyTvl.gt(underlyingTvl)) {
    return { underlyingTvl: beefyTvl, percent: 1 };
  } else {
    return {
      underlyingTvl,
      percent: underlyingTvl.gt(BIG_ZERO) ? beefyTvl.div(underlyingTvl).toNumber() : 0,
    };
  }
}
