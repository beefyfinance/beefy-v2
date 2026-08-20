import type { SortedOptions } from '../../hook';
interface FilterProps {
    sortOptions: SortedOptions;
    handleSort: (field: SortedOptions['sort']) => void;
    handleSearchText: (newValue: string) => void;
    searchText: string;
}
export declare const Filter: (({ sortOptions, handleSort, handleSearchText, searchText, }: FilterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
