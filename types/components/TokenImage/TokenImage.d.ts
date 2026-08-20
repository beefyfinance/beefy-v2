import { type CssStyles } from '@repo/styles/css';
import type { ChainEntity } from '../../features/data/entities/chain';
import type { TokenEntity } from '../../features/data/entities/token';
import type { VaultEntity } from '../../features/data/entities/vault';
import type { AssetsImageProps } from '../AssetsImage/AssetsImage';
type AddressChainIdOptions = {
    address: TokenEntity['address'];
    chainId: ChainEntity['id'];
};
type TokenOptions = {
    token: Token;
};
type TokensOptions = {
    tokens: Token[];
};
type VaultIdOptions = {
    vaultId: VaultEntity['id'];
    assetsOnly?: boolean;
};
type VaultOptions = {
    vault: VaultEntity;
    assetsOnly?: boolean;
};
type CommonTokenImageProps = {
    size?: AssetsImageProps['size'];
    css?: CssStyles;
};
type Token = Pick<TokenEntity, 'address' | 'symbol' | 'chainId'>;
export type TokenImageProps = AddressChainIdOptions & CommonTokenImageProps;
export declare const TokenImage: (({ size, css: cssProp, ...options }: TokenImageProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TokenImageFromEntityProps = TokenOptions & CommonTokenImageProps;
export declare const TokenImageFromEntity: (({ size, css: cssProp, ...options }: TokenImageFromEntityProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TokensImageProps = TokensOptions & CommonTokenImageProps;
export declare const TokensImage: (({ size, css: cssProp, ...options }: TokensImageProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TokensImageWithChainProps = TokensOptions & CommonTokenImageProps & {
    chainId: ChainEntity['id'];
};
export declare const TokensImageWithChain: (({ size, css: cssProp, chainId, ...options }: TokensImageWithChainProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type VaultIdImageProps = VaultIdOptions & CommonTokenImageProps;
export declare const VaultIdImage: (({ size, css: cssProp, ...options }: VaultIdImageProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type VaultImageProps = VaultOptions & CommonTokenImageProps;
export declare const VaultImage: (({ size, css: cssProp, ...options }: VaultImageProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type VaultDepositTokenImageProps = Omit<VaultOptions, 'assetsOnly'> & CommonTokenImageProps;
export declare const VaultDepositTokenImage: (({ size, css: cssProp, ...options }: VaultImageProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
