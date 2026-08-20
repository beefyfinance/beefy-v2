import type { CssStyles } from '@repo/styles/css';
export type RecoveryQuoteErrorAlertProps = {
    action: 'deposit' | 'withdraw';
    css?: CssStyles;
};
export declare const RecoveryQuoteErrorAlert: (({ action, css: cssProp, }: RecoveryQuoteErrorAlertProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
