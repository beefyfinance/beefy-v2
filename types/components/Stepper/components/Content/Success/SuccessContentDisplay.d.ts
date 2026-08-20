import { type ReactNode } from 'react';
import type { VaultEntity } from '../../../../../features/data/entities/vault';
export type SuccessContentDisplayProps = {
    title: string;
    message: ReactNode;
    messageHighlight?: ReactNode;
    rememberTitle?: string;
    rememberMessage?: ReactNode;
    shareVaultId?: VaultEntity['id'];
};
export declare const SuccessContentDisplay: (({ title, message, messageHighlight, rememberTitle, rememberMessage, shareVaultId, }: SuccessContentDisplayProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
