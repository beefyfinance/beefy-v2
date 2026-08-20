import { type CssStyles } from '@repo/styles/css';
import type { TransactQuote, ZapQuote } from '../../../../../data/apis/transact/transact-types';
export type QuoteTitleProps = {
    quote: TransactQuote;
    css?: CssStyles;
};
export declare const QuoteTitle: (({ quote, css: cssProp }: QuoteTitleProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ZapQuoteTitleProps = {
    quote: ZapQuote;
    css?: CssStyles;
};
export declare const ZapQuoteTitle: (({ quote, css: cssProp, }: ZapQuoteTitleProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
