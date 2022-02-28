import { isTokenNative, TokenEntity, TokenErc20 } from '../entities/token';

export function getZapAddress(token: TokenEntity, wnative: TokenErc20) {
  return isTokenNative(token)
    ? token.address !== null
      ? token.address
      : wnative.contractAddress
    : token.contractAddress;
}
export function getZapDecimals(token: TokenEntity, wnative: TokenErc20) {
  return isTokenNative(token)
    ? token.address !== null
      ? token.decimals
      : wnative.decimals
    : token.decimals;
}
