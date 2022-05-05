import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';

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
