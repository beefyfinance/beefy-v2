import type { TokenEntity, TokenErc20, TokenNative } from '../../../entities/token';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenAmount } from '../transact-types';
/**
 * Returns wnative if token is native
 * Otherwise returns token
 * Note: Only valid when token/wnative are on the same chain
 */
export declare function nativeToWNative(token: TokenEntity, wnative: TokenErc20): TokenErc20;
/**
 * Returns native if token is wnative
 * Otherwise returns token
 */
export declare function wnativeToNative(token: TokenEntity, wnative: TokenErc20, native: TokenNative): TokenEntity;
/**
 * Swaps any native tokens to their wrapped version for use in LPs
 * Assumes LPs only use wrapped tokens
 * Used as vault assets sometimes have native listed when they should be wrapped
 */
export declare function tokensToLp(tokens: TokenEntity[], wnative: TokenErc20): TokenErc20[];
/**
 * Ensures WNATIVE and NATIVE is in list, if either one of them are already
 * Used in zaps so user can pick either native or wrapped when either is part of an LP
 */
export declare function includeWrappedAndNative(tokens: TokenEntity[], wnative: TokenErc20, native: TokenNative): TokenEntity[];
/**
 * Sorts tokens by their lowercase address
 */
export declare function sortTokens<T extends TokenEntity>(tokens: T[]): T[];
/**
 * Sorts addresses lowercase alphabetically
 */
export declare function sortTokenAddresses(addresses: TokenEntity['address'][]): TokenEntity['address'][];
/**
 * Returns list of unique tokens by chainId and address
 */
export declare function uniqueTokens<T extends TokenEntity = TokenEntity>(tokens: T[]): T[];
/**
 * Merges multiple lists of tokens into a single unique list
 */
export declare function mergeTokenLists(...lists: TokenEntity[][]): TokenEntity[];
/**
 * Returns true if all tokens are different from each other
 */
export declare function allTokensAreDistinct(inputs: TokenEntity[]): boolean;
/**
 * Returns true for chains where native and wnative balances are treated as one
 * (Chains where there is no need to wrap or unwrap)
 */
export declare function nativeAndWrappedAreSame(chainId: ChainEntity['id']): boolean;
export declare function pickTokens(...inputs: TokenAmount[][]): TokenEntity[];
