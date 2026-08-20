import type { ChainEntity } from '../features/data/entities/chain';
export declare function explorerTokenUrl(chain: ChainEntity, tokenAddress: string): string;
export declare function explorerAddressUrl(chain: ChainEntity, address: string): string;
export declare function explorerTxUrl(chain: ChainEntity, txHash: string): string;
