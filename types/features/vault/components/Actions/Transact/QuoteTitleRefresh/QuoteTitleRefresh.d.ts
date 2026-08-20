import { type CssStyles } from '@repo/styles/css';
import { type ReloadSpinnerState } from '../../../../../../components/ReloadSpinner/ReloadSpinner';
export type QuoteTitleRefreshProps = {
    title: string;
    enableRefresh?: ReloadSpinnerState;
    autoRefresh?: boolean;
    autoRefreshSeconds?: number;
    onRefresh?: () => void;
    css?: CssStyles;
};
export declare const QuoteTitleRefresh: (({ title, enableRefresh, autoRefresh, autoRefreshSeconds, onRefresh, css: cssProp, }: QuoteTitleRefreshProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
