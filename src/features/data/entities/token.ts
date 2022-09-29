import { ChainEntity } from './chain';
import { PlatformEntity } from './platform';
import { LpData } from '../apis/beefy';

/**
 * A token can be anything erc20-like
 *  - A standard token like AAVE, BIFI, CRV, ...
 *  - An LP token
 *  - A fake "unique token identifier" for boosts virtual earned token
 */
export type TokenEntity = TokenErc20 | TokenNative;

/**
 * Common token fields
 */
export interface TokenBase {
  id: string;
  symbol: string;
  name?: string;
  providerId?: PlatformEntity['id'];
  chainId: ChainEntity['id'];
  oracleId: string;
  address: string;
  decimals: number;
  buyUrl: string | null; // link to 1inch/pancake/...
  type: 'erc20' | 'native';
  website: string | null;
  description: string | null;
}

/**
 * This represents a token implementation in a specific chain
 * We need this because tokens can have different implementations
 * On multiple chains
 */
export interface TokenErc20 extends TokenBase {
  type: 'erc20';
}

/**
 * The gas token of the base chain
 * Doesn't have a contract address
 */
export interface TokenNative extends TokenBase {
  // some chains have addressable native tokens
  // maybe this should be a separate interface
  type: 'native';
}

// provide type guards

export function isTokenErc20(token: TokenEntity): token is TokenErc20 {
  return token.type === 'erc20';
}

export function isTokenNative(token: TokenEntity): token is TokenNative {
  return token.type === 'native';
}

export function getTokenDisplayName(token: TokenEntity): string {
  if (token.name !== null && token.name !== undefined) {
    if (token.name !== token.symbol) {
      return `${token.name} (${token.symbol})`;
    } else {
      return token.name;
    }
  } else {
    return token.symbol;
  }
}

export type TokenLpBreakdown = LpData;
