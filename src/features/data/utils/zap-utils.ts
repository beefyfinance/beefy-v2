import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';
import { BigNumber } from 'bignumber.js';
import { BIG_ONE } from '../../../helpers/big-number';

export function getZapAddress(token: TokenEntity, wnative: TokenErc20) {
  return isTokenNative(token)
    ? token.address !== 'native'
      ? token.address
      : wnative.address
    : token.address;
}

export function getZapDecimals(token: TokenEntity, wnative: TokenErc20) {
  return isTokenNative(token)
    ? token.address !== 'native'
      ? token.decimals
      : wnative.decimals
    : token.decimals;
}

/**
 * @param amountIn amount being swapped
 * @param reserveIn reserves of token being swapped; swap units as amountIn
 * @param providerFee as decimal e.g. 0.003 for 0.3%
 */
export function calculatePriceImpact(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  providerFee: number
): number {
  const amountInAfterFee = amountIn.multipliedBy(BIG_ONE.minus(providerFee));
  return amountInAfterFee.dividedBy(reserveIn.plus(amountInAfterFee)).toNumber();
}
