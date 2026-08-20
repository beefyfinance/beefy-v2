import type { ChainEntity } from '../../features/data/entities/chain';
import { type CssStyles } from '@repo/styles/css';
type CommonProps = {
    size?: number;
    css?: CssStyles;
};
export type AssetsImageProps = {
    chainId?: ChainEntity['id'] | undefined;
    assetSymbols: string[];
} & CommonProps;
export declare const AssetsImage: import("react").NamedExoticComponent<AssetsImageProps>;
export type MissingAssetsImageProps = CommonProps;
export declare const MissingAssetsImage: import("react").NamedExoticComponent<CommonProps>;
export type AssetsImageWithChainProps = {
    chainId?: ChainEntity['id'];
    assetSymbols: string[];
} & CommonProps;
export declare const AssetsImageWithChain: import("react").NamedExoticComponent<AssetsImageWithChainProps>;
export {};
