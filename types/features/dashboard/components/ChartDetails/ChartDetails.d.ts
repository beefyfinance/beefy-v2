import type { BaseEntry } from '../../../data/utils/array-utils';
type ItemType = BaseEntry & {
    label?: string;
};
interface ChartDetailsProps {
    data: ItemType[];
}
export declare const ChartDetails: (({ data }: ChartDetailsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
