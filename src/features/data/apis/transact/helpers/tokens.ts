import type { TokenEntity, TokenErc20, TokenNative } from '../../../entities/token.ts';
import { isTokenEqual, isTokenNative } from '../../../entities/token.ts';
import { sortBy, uniqBy } from 'lodash-es';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenAmount } from '../transact-types.ts';

/**
 * Returns wnative if token is native
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
 * Assumes LPs only use wrapped tokens
 * Used as vault assets sometimes have native listed when they should be wrapped
 */
export function tokensToLp(tokens: TokenEntity[], wnative: TokenErc20): TokenErc20[] {
  return sortTokens(tokens.map(token => nativeToWNative(token, wnative)));
}

/**
 * Ensures WNATIVE and NATIVE is in list, if either one of them are already
 * Used in zaps so user can pick either native or wrapped when either is part of an LP
 */
export function includeWrappedAndNative(
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
 * Sorts tokens by their lowercase address
 */
export function sortTokens<T extends TokenEntity>(tokens: T[]): T[] {
  return sortBy(tokens, token => token.address.toLowerCase());
}

/**
 * Sorts addresses lowercase alphabetically
 */
export function sortTokenAddresses(addresses: TokenEntity['address'][]): TokenEntity['address'][] {
  return sortBy(addresses, address => address.toLowerCase());
}

/**
 * Returns list of unique tokens by chainId and address
 */
export function uniqueTokens<T extends TokenEntity = TokenEntity>(tokens: T[]): T[] {
  return uniqBy(tokens, token => `${token.chainId}-${token.address.toLowerCase()}`);
}

/**
 * Merges multiple lists of tokens into a single unique list
 */
export function mergeTokenLists(...lists: TokenEntity[][]): TokenEntity[] {
  return uniqueTokens(lists.flat());
}

/**
 * Returns true if all tokens are different from each other
 */
export function allTokensAreDistinct(inputs: TokenEntity[]): boolean {
  return inputs.every((input, i) => inputs.findIndex(other => isTokenEqual(input, other)) === i);
}

/**
 * Returns true for chains where native and wnative balances are treated as one
 * (Chains where there is no need to wrap or unwrap)
 */
export function nativeAndWrappedAreSame(chainId: ChainEntity['id']) {
  return ['metis', 'celo'].includes(chainId);
}

export function pickTokens(...inputs: TokenAmount[][]): TokenEntity[] {
  return uniqueTokens(inputs.flat().map(({ token }) => token));
}
