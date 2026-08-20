import type { BreakdownMode, CalculatedBreakdownData } from '../../types';
export type ChartWithLegendProps = {
    breakdown: CalculatedBreakdownData;
    tab: BreakdownMode;
};
export declare const ChartWithLegend: (({ breakdown, tab, }: ChartWithLegendProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
