import type { TokenEntity } from '../features/data/entities/token';
import type { ChainEntity } from '../features/data/entities/chain';
export declare function getSingleAssetSrc(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): string | undefined;
export declare function singleAssetExists(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): boolean;
