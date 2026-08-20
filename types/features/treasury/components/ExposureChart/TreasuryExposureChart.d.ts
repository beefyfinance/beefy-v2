import type { GenericExposurePieChartProps } from '../../../../components/PieChart/types';
type TreasuryExposureChartProps = Omit<GenericExposurePieChartProps, 'type'>;
export declare const TreasuryExposureChart: (({ data, formatter, }: TreasuryExposureChartProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
