import { ChainEntity } from './chain';

/**
 * A token can be anything erc20-like
 *  - A standard token like AAVE, BIFI, CRV, ...
 *  - An LP token
 *  - A fake "unique token identifier" for boosts virtual earned token
 */
export interface TokenEntity {
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
}

/**
 * This represents a token implementation in a specific chain
 * We need this because tokens can have different implementations
 * On multiple chains
 */
interface TokenImplemContract {
  id: string;

  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  contractAddress: string;
  decimals: number;
  buyUrl: string; // link to 1inch/pancake/...
}

// todo decide if this is really needed
/**
 * The gas token of the base chain
 * Doesn't have a contract address
 */
interface TokenImplemGas {
  id: string;

  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  decimals: number;
  buyUrl: string; // link to 1inch/pancake/...
}

export type TokenImplem = TokenImplemContract | TokenImplemGas;
