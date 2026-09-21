import BigNumber from 'bignumber.js';
import type {
  SharedBalanceWnative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../../../entities/token.ts';
import {
  isSharedBalanceToken,
  isTokenEqual,
  isTokenNative,
  sharedPrecisionDecimals,
  tokenEqualityKey,
} from '../../../entities/token.ts';
import { sortBy } from 'lodash-es';
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
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const token of tokens) {
    const key = `${token.chainId}-${token.address.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(token);
    }
  }
  return unique;
}

/**
 * Merges multiple lists of tokens into a single unique list
 */
export function mergeTokenLists(...lists: TokenEntity[][]): TokenEntity[] {
  return uniqueTokens(lists.flat());
}

/**
 * Of {@link candidates}, those that every wanted token can reach: either the candidate is that
 * wanted token, or it appears in that wanted token's supported list.
 * {@link supportedPerWanted} is indexed to match {@link wantedTokens}.
 */
export function tokensReachableFromAll(
  candidates: TokenEntity[],
  wantedTokens: TokenEntity[],
  supportedPerWanted: TokenEntity[][]
): TokenEntity[] {
  const wantedKeys = wantedTokens.map(tokenEqualityKey);
  const supportedKeysPerWanted = supportedPerWanted.map(
    tokens => new Set(tokens.map(tokenEqualityKey))
  );

  return candidates.filter(candidate => {
    const candidateKey = tokenEqualityKey(candidate);
    return wantedKeys.every(
      (wantedKey, i) => wantedKey === candidateKey || supportedKeysPerWanted[i].has(candidateKey)
    );
  });
}

/** the token whose balance is spent: either side of a shared pair is its erc20 view */
function toBalanceToken(
  token: TokenEntity,
  sharedWnative: SharedBalanceWnative | undefined
): TokenEntity {
  return isSharedBalanceToken(token, sharedWnative) ? sharedWnative : token;
}

/**
 * Returns true if all tokens are different from each other
 */
export function allTokensAreDistinct(inputs: TokenEntity[]): boolean {
  return inputs.every((input, i) => inputs.findIndex(other => isTokenEqual(input, other)) === i);
}

/**
 * Native <-> wnative on a chain where both are one balance, so moving between them needs no call
 */
export function isSameBalancePair(
  a: TokenEntity,
  b: TokenEntity,
  sharedWnative: SharedBalanceWnative | undefined
): boolean {
  return (
    !isTokenEqual(a, b) &&
    isSharedBalanceToken(a, sharedWnative) &&
    isSharedBalanceToken(b, sharedWnative)
  );
}

/** same token, or the other view of the same balance: either way no swap is needed */
export function isSameOrSharedBalance(
  a: TokenEntity,
  b: TokenEntity,
  sharedWnative: SharedBalanceWnative | undefined
): boolean {
  return isTokenEqual(toBalanceToken(a, sharedWnative), toBalanceToken(b, sharedWnative));
}

/**
 * Amounts are in whole tokens, so native and wnative need no conversion factor, but the wnative
 * view can hold fewer decimals (arc: 6 vs 18, balanceOf truncates the rest).
 * No-op unless token is native/wnative and sharedWnative is set.
 */
export function floorToSharedPrecision(
  amount: BigNumber,
  token: TokenEntity,
  sharedWnative: SharedBalanceWnative | undefined
): BigNumber {
  if (!isSharedBalanceToken(token, sharedWnative)) {
    return amount;
  }
  return amount.decimalPlaces(sharedPrecisionDecimals(token, sharedWnative), BigNumber.ROUND_FLOOR);
}

export function pickTokens(...inputs: TokenAmount[][]): TokenEntity[] {
  return uniqueTokens(inputs.flat().map(({ token }) => token));
}
