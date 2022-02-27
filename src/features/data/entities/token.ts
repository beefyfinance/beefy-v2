import { ChainEntity } from './chain';

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
  chainId: ChainEntity['id'];
  contractAddress: string;
  decimals: number;
  buyUrl: string | null; // link to 1inch/pancake/...
  type: 'erc20';
  website: string | null;
  description: string | null;
}

/**
 * The gas token of the base chain
 * Doesn't have a contract address
 */
export interface TokenNative {
  id: string;
  symbol: string;
  chainId: ChainEntity['id'];
  // some chains have addressable native tokens
  // maybe this should be a separate interface
  address: string | null;
  decimals: number;
  buyUrl: string | null; // link to 1inch/pancake/...
  type: 'native';
  website: string | null;
  description: string | null;
}

// provide type guards

export function isTokenErc20(token: TokenEntity): token is TokenErc20 {
  return token.type === 'erc20';
}
export function isTokenNative(token: TokenEntity): token is TokenNative {
  return token.type === 'native';
}
