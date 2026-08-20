import type { TransactQuote } from '../../../../../data/apis/transact/transact-types';
import { type CssStyles } from '@repo/styles/css';
export type PriceImpactNoticeProps = {
    quote: TransactQuote;
    onChange: (shouldDisable: boolean) => void;
    hideCheckbox?: boolean;
    css?: CssStyles;
};
export declare const PriceImpactNotice: (({ quote, onChange, css: cssProp, hideCheckbox, }: PriceImpactNoticeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
