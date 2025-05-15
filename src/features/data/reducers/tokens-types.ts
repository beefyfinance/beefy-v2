import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain.ts';
import type {
  CurrentCowcentratedRangeData,
  TokenEntity,
  TokenErc20,
  TokenLpBreakdown,
  TokenNative,
} from '../entities/token.ts';

/**
 * State containing Vault infos
 */
export type TokensState = {
  // we need to split by chain because tokens from different chains have the same ids
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      byId: {
        [id: string]: TokenEntity['address'];
      };
      byAddress: {
        [address: string]: TokenEntity;
      };
      native: TokenNative['id'] | undefined;
      wnative: TokenErc20['id'] | undefined;
      /**
       * we keep the list of tokens where we could be interested in fetching the balance of
       * it would be more correct to put those inside the balance reducer but this token
       * reducer has a number of config fixes that I find would make for a more complex code
       * if refactored. And we have to update the config anyway to make it smaller, so move this
       * inside the balance reducer once the config is reworked
       */
      interestingBalanceTokenAddresses: TokenEntity['address'][];
      /** list of tokens that have an active vault */
      tokenIdsInActiveVaults: TokenEntity['id'][];
    };
  };
  prices: {
    byOracleId: {
      [tokenId: TokenEntity['oracleId']]: BigNumber;
    };
  };
  breakdown: {
    byOracleId: {
      [tokenId: TokenEntity['oracleId']]: TokenLpBreakdown;
    };
  };
  cowcentratedRanges: {
    byOracleId: {
      [tokenId: TokenEntity['oracleId']]: CurrentCowcentratedRangeData;
    };
  };
};
