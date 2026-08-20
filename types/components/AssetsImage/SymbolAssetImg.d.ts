import type { ChainEntity } from '../../features/data/entities/chain';
type SymbolAssetImgProps = {
    symbol: string;
    chainId?: ChainEntity['id'];
    className?: string;
};
export declare const SymbolAssetImg: import("react").NamedExoticComponent<SymbolAssetImgProps>;
export {};
