import type { BreakdownMode, CalculatedBreakdownData } from '../../types';
import { type CssStyles } from '@repo/styles/css';
export type BreakdownTableProps = {
    mode: BreakdownMode;
    breakdown: CalculatedBreakdownData;
    css?: CssStyles;
};
export declare const BreakdownTable: (({ mode, breakdown, css: cssProp, }: BreakdownTableProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
