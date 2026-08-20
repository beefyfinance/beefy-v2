import { type CssStyles } from '@repo/styles/css';
/** true: visible + clickable; false: not rendered; disabled: visible, not clickable */
export type ReloadSpinnerState = boolean | 'disabled';
export type ReloadSpinnerProps = {
    state?: ReloadSpinnerState;
    autoRefresh?: boolean;
    autoRefreshSeconds?: number;
    onClick?: () => void;
    css?: CssStyles;
};
export declare const ReloadSpinner: (({ state, autoRefresh, autoRefreshSeconds, onClick, css: cssProp, }: ReloadSpinnerProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
