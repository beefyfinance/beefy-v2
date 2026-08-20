import { type CssStyles } from '@repo/styles/css';
import { type VaultCowcentratedLike, type VaultEntity } from '../../../../features/data/entities/vault';
type VaultPlatformTagProps = {
    vaultId: VaultEntity['id'];
    css?: CssStyles;
};
export declare const VaultPlatformTag: (({ vaultId, css: cssProp, }: VaultPlatformTagProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const VaultClmLikeTag: (({ vault, hideFee, hideLabel, css: cssProp, onlyIcon, }: {
    vault: VaultCowcentratedLike;
    hideFee?: boolean;
    hideLabel?: boolean;
    css?: CssStyles;
    onlyIcon?: boolean;
}) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export type VaultTagsProps = {
    vaultId: VaultEntity['id'];
    isVaultPaused?: boolean;
    hidePlatform?: boolean;
};
export declare const VaultTags: (({ vaultId, hidePlatform }: VaultTagsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
