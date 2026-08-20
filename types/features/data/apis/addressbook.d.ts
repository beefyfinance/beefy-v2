import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
export interface ChainAddressBook {
    [tokenId: TokenEntity['id']]: TokenEntity;
}
export declare const getChainAddressBook: ((chain: ChainEntity) => Promise<ChainAddressBook>) & import("lodash").MemoizedFunction;
