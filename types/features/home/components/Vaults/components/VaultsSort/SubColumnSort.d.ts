import { type FilteredVaultsState, type SortWithSubSort } from '../../../../../data/reducers/filtered-vaults-types';
export type FilterSubColumn<T extends SortWithSubSort> = {
    label: string;
    value: FilteredVaultsState['subSort'][T];
};
export type SubColumnSortProps<T extends SortWithSubSort> = {
    columnSelected: boolean;
    columnKey: T;
    subColumns: FilterSubColumn<T>[];
};
export declare const SubColumnSort: (<T extends SortWithSubSort>({ columnSelected, columnKey, subColumns, }: SubColumnSortProps<T>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
