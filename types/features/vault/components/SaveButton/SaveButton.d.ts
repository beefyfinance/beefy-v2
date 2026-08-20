import { type CssStyles } from '@repo/styles/css';
import type { VaultEntity } from '../../../data/entities/vault';
interface SaveButtonProps {
    vaultId: VaultEntity['id'];
    css?: CssStyles;
}
export declare const SaveButton: (({ vaultId, css: cssProp }: SaveButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
