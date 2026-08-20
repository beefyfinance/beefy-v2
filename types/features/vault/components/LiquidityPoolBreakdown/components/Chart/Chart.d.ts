import type { CalculatedAsset } from '../../types';
export type ChartProps = {
    assets: CalculatedAsset[];
    isUnderlying?: boolean;
};
export declare const Chart: (({ assets, isUnderlying }: ChartProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
