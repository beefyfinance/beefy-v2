import type { BaseEntry } from '../../../data/utils/array-utils';
interface ExposureLegendProps {
    data: BaseEntry[];
    formatter?: (s: string) => string;
}
export declare const ExposureLegend: (({ data, formatter, }: ExposureLegendProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
