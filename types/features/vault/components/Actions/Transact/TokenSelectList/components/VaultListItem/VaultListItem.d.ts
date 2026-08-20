import { type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../../../../../data/entities/vault';
export type VaultListItemProps = {
    selectionId: string;
    vaultId: VaultEntity['id'];
    /** Defined for deposit side (src-vault) when a wallet is connected. */
    balance?: BigNumber;
    balanceValue?: BigNumber;
    decimals: number;
    mode: 'vault-src' | 'vault-dst';
    onSelect: (id: string) => void;
    css?: CssStyles;
};
export declare const VaultListItem: (({ selectionId, vaultId, balance, balanceValue, decimals, mode, css: cssProp, onSelect, }: VaultListItemProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
