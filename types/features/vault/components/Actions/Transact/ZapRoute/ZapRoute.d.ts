import { type CssStyles } from '@repo/styles/css';
import { type ZapQuote } from '../../../../../data/apis/transact/transact-types';
export type StepStatusState = 'list' | 'finished' | 'inProgress' | 'notStarted' | 'failed';
export type ZapRouteProps = {
    quote: ZapQuote;
    css?: CssStyles;
    expandable?: boolean;
    enableRefresh?: boolean;
};
export declare const ZapRoute: (({ quote, css: cssProp, expandable, enableRefresh, }: ZapRouteProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export type ZapRoutePlaceholderProps = {
    css?: CssStyles;
};
export declare const ZapRoutePlaceholder: (({ css: cssProp, }: ZapRoutePlaceholderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
