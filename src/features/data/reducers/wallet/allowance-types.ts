import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenEntity } from '../../entities/token.ts';

/**
 * State containing user allowances state
 * Allowance being the amount allowed to be spent big a contract
 * for the currently connected user
 */
export interface AllowanceState {
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      byTokenAddress: {
        [tokenAddress: TokenEntity['address']]: {
          bySpenderAddress: {
            [spenderAddress: string]: BigNumber;
          };
        };
      };
    };
  };
}
