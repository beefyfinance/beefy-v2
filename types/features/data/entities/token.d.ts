import type { ChainEntity } from './chain';
import type { PlatformEntity } from './platform';
import type BigNumber from 'bignumber.js';
import type { LpData } from '../apis/beefy/beefy-api-types';
/**
 * A token can be anything erc20-like
 *  - A standard token like AAVE, BIFI, CRV, ...
 *  - An LP token
 *  - A fake "unique token identifier" for boosts virtual earned token
 */
export type TokenEntity = TokenErc20 | TokenNative;
/**
 * This represents a token implementation in a specific chain
 * We need this because tokens can have different implementations
 * On multiple chains
 */
export interface TokenErc20 {
    id: string;
    symbol: string;
    providerId?: PlatformEntity['id'];
    chainId: ChainEntity['id'];
    oracleId: string;
    address: string;
    decimals: number;
    buyUrl: string | undefined;
    type: 'erc20';
    website: string | undefined;
    description: string | undefined;
    documentation: string | undefined;
    bridge?: string;
    tags: string[];
}
/**
 * The gas token of the base chain
 * Doesn't have a contract address
 */
export interface TokenNative {
    id: string;
    symbol: string;
    providerId?: PlatformEntity['id'];
    chainId: ChainEntity['id'];
    oracleId: string;
    address: string;
    decimals: number;
    buyUrl: string | undefined;
    type: 'native';
    website: string | undefined;
    description: string | undefined;
    documentation: string | undefined;
    tags: string[];
}
export declare function isTokenErc20(token: TokenEntity): token is TokenErc20;
export declare function isTokenNative(token: TokenEntity): token is TokenNative;
export declare function isTokenEqual(tokenA: TokenEntity, tokenB: TokenEntity): boolean;
export type TokenLpBreakdown = LpData;
export type CurrentCowcentratedRangeData<T = BigNumber> = {
    currentPrice: T;
    priceRangeMin: T;
    priceRangeMax: T;
};
