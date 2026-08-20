import type { ChainEntity } from '../../../data/entities/chain';
import type { TokenEntity } from '../../../data/entities/token';
declare function TokenCardComponent({ chainId, tokenId, }: {
    chainId: ChainEntity['id'];
    tokenId: TokenEntity['id'];
}): import("react/jsx-runtime").JSX.Element;
export declare const TokenCard: typeof TokenCardComponent & {
    displayName?: string;
};
export {};
