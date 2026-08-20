import { type CssStyles } from '@repo/styles/css';
export type NoGraphDataReason = 'error' | 'error-retry' | 'wait-collect';
export type NoGraphDataProps = {
    css?: CssStyles;
    reason: NoGraphDataReason;
};
export declare const GraphNoData: (({ css: cssProp, reason }: NoGraphDataProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
