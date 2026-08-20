import type { TransactQuote } from '../../../../../data/apis/transact/transact-types';
import { type CssStyles } from '@repo/styles/css';
export type MaxNativeProps = {
    quote: TransactQuote;
    onChange: (shouldDisable: boolean) => void;
    css?: CssStyles;
};
export declare const MaxNativeNotice: (({ quote, onChange, css: cssProp, }: MaxNativeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
