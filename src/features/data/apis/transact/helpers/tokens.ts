import {
  isTokenEqual,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../../../entities/token';
import { sortBy } from 'lodash';

/**
 * Returns wnative if token is native with an address of 'native'
 * Otherwise returns token
 * Note: Only valid when token/wnative are on the same chain
 */
export function nativeToWNative(token: TokenEntity, wnative: TokenErc20): TokenErc20 {
  if (isTokenNative(token)) {
    return wnative;
  }

  return token;
}

/**
 * Returns native if token is wnative
 * Otherwise returns token
 */
export function wnativeToNative(
  token: TokenEntity,
  wnative: TokenErc20,
  native: TokenNative
): TokenEntity {
  if (isTokenEqual(token, wnative)) {
    return native;
  }

  return token;
}

/**
 * Swaps any native tokens to their wrapped version for use in LPs
 */
export function tokensToLp(tokens: TokenEntity[], wnative: TokenErc20): TokenErc20[] {
  return sortTokens(tokens.map(token => nativeToWNative(token, wnative)));
}

/**
 * Ensures WNATIVE and NATIVE is in list, if either one of them are already
 * All beefy zap-ins allow either, and will automatically wrap the native
 */
export function tokensToZapIn(
  tokens: TokenEntity[],
  wnative: TokenErc20,
  native: TokenNative
): TokenEntity[] {
  const out = [...tokens];
  const hasNative = tokens.find(
    token => token.type === 'native' && token.address === native.address
  );
  const hasWrappedNative = tokens.find(token => token.address === wnative.address);

  if (hasWrappedNative && !hasNative) {
    out.unshift(native);
  }

  if (hasNative && !hasWrappedNative) {
    out.unshift(wnative);
  }

  return out;
}

/**
 * Removes WNATIVE from list and replaces with NATIVE
 * All beefy zap-outs unwrap WNATIVE before being sent to user
 */
export function tokensToZapWithdraw(
  tokens: TokenEntity[],
  wnative: TokenErc20,
  native: TokenNative
): TokenEntity[] {
  const withoutWrapped = tokens.filter(token => token.address !== wnative.address);
  const wrappedWasRemoved = withoutWrapped.length < tokens.length;

  if (wrappedWasRemoved) {
    const hasNative = tokens.find(
      token => token.type === 'native' && token.address === native.address
    );
    if (!hasNative) {
      withoutWrapped.unshift(native);
    }
  }

  return withoutWrapped;
}

/**
 * Sorts tokens by their address
 */
export function sortTokens<T extends TokenEntity>(tokens: T[]): T[] {
  return sortBy(tokens, token => token.address.toLowerCase());
}

export function sortTokenAddresses(addresses: TokenEntity['address'][]): TokenEntity['address'][] {
  return sortBy(addresses, address => address.toLowerCase());
}
