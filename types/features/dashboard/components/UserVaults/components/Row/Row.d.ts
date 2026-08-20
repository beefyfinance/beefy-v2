import { type CssStyles } from '@repo/styles/css';
import type { PropsWithChildren } from 'react';
type RowGapProps = PropsWithChildren<{
    css?: CssStyles;
}>;
export declare const Row: (({ children, css: cssProp }: RowGapProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const RowMobile: (({ children, css: cssProp }: RowGapProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
