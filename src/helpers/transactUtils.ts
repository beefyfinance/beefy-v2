import type { TransactQuote } from '../features/data/apis/transact/transact-types.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';

/**
 * Extract the chain ID where the transaction will execute.
 * For cross-chain transactions, this is the source chain (not the vault's chain).
 */
export function getExecutionChainId(quote: TransactQuote): ChainEntity['id'] {
  if ('sourceChainId' in quote.option) {
    return quote.option.sourceChainId;
  }
  return quote.option.chainId;
}
