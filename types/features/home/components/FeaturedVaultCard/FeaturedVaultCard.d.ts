import { type CssStyles } from '@repo/styles/css';
import type { VaultEntity } from '../../../data/entities/vault';
export type FeaturedVaultCardProps = {
    vaultId: VaultEntity['id'];
    showChainBadge?: boolean;
    css?: CssStyles;
};
export declare const FeaturedVaultCard: (({ vaultId, showChainBadge, css: cssProp, }: FeaturedVaultCardProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
