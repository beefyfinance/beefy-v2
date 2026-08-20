import { type CssStyles } from '@repo/styles/css';
import type { ChainEntity } from '../../features/data/entities/chain';
import type { VaultEntity } from '../../features/data/entities/vault';
export type VaultNameProps = {
    vaultId: VaultEntity['id'];
    isLink?: boolean;
};
export declare const VaultName: (({ vaultId, isLink }: VaultNameProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type VaultNetworkProps = {
    chainId: ChainEntity['id'];
    css?: CssStyles;
};
export declare const VaultNetwork: (({ chainId, css: cssProp, }: VaultNetworkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type VaultIdentityProps = {
    vaultId: VaultEntity['id'];
    networkCss?: CssStyles;
    isLink?: boolean;
};
export declare const VaultIdentity: (({ vaultId, networkCss, isLink, }: VaultIdentityProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const VaultIdentityContent: (({ vaultId, networkCss, isLink, }: VaultIdentityProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
