import { ChainEntity } from './chain';

/**
 * A token can be anything erc20-like
 *  - A standard token like AAVE, BIFI, CRV, ...
 *  - An LP token
 *  - A fake "unique token identifier" for boosts virtual earned token
 */
export type TokenEntity = TokenStandard | TokenBoost;

interface TokenStandard {
  id: string;
  symbol: string;
  description: string;
  descriptionUrl: string;
  project: {
    url: string; // "https://ageoftanks.io/"
    telegram: string | null;
    twitter: string | null;
    discord: string | null;
  } | null; // some tokens don't have a "project"
  isBoost: false;
}
interface TokenBoost {
  id: string;
  symbol: string;
  isBoost: true;
}

// provide type guards
export function isBoostToken(token: TokenEntity): token is TokenBoost {
  return token.isBoost === true;
}

/**
 * This represents a token implementation in a specific chain
 * We need this because tokens can have different implementations
 * On multiple chains
 */
export interface TokenImplemErc20 {
  id: string;

  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  contractAddress: string;
  decimals: number;
  buyUrl: string; // link to 1inch/pancake/...
  type: 'erc20';
}

// todo decide if this is really needed
/**
 * The gas token of the base chain
 * Doesn't have a contract address
 */
interface TokenImplemNative {
  id: string;

  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  decimals: number;
  buyUrl: string; // link to 1inch/pancake/...
  type: 'native';
}

interface TokenImplemBoost {
  id: string;
  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  symbol: string;
  type: 'boost';
}

export type TokenImplemEntity = TokenImplemErc20 | TokenImplemNative | TokenImplemBoost;

export function isTokenImplemErc20(
  tokenImplem: TokenImplemEntity
): tokenImplem is TokenImplemErc20 {
  return tokenImplem.type === 'erc20';
}
export function isTokenImplemNative(
  tokenImplem: TokenImplemEntity
): tokenImplem is TokenImplemNative {
  return tokenImplem.type === 'native';
}
export function isTokenImplemBoost(
  tokenImplem: TokenImplemEntity
): tokenImplem is TokenImplemBoost {
  return tokenImplem.type === 'boost';
}
