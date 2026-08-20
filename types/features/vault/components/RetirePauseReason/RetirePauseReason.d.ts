import { type CssStyles } from '@repo/styles/css';
import { type VaultEntity } from '../../../data/entities/vault';
export type RetirePauseReasonProps = {
    vaultId: VaultEntity['id'];
    css?: CssStyles;
};
export declare const RetirePauseReason: (({ vaultId, css: cssProp, }: RetirePauseReasonProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
