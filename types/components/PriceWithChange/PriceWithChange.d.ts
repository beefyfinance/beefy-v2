import { type CssStyles } from '@repo/styles/css';
export type PriceWithChangeProps = {
    oracleId: string;
    css?: CssStyles;
};
export declare const PriceWithChange: (({ oracleId, css: cssProp, }: PriceWithChangeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
