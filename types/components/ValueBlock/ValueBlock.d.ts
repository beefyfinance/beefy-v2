import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
type ValueBlockProps = {
    label: ReactNode;
    value: ReactNode;
    textContent?: boolean;
    tooltip?: ReactNode;
    usdValue?: ReactNode;
    loading?: boolean;
    blurred?: boolean;
    labelCss?: CssStyles;
    valueCss?: CssStyles;
    priceCss?: CssStyles;
};
export declare const ValueBlock: (({ label, value, textContent, tooltip, usdValue, loading, blurred, labelCss, valueCss, priceCss, }: ValueBlockProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
