import type { TransactQuote } from '../features/data/apis/transact/transact-types';
import type { ChainEntity } from '../features/data/entities/chain';
/**
 * Extract the chain ID where the transaction will execute.
 * For cross-chain transactions, this is the source chain (not the vault's chain).
 */
export declare function getExecutionChainId(quote: TransactQuote): ChainEntity['id'];
