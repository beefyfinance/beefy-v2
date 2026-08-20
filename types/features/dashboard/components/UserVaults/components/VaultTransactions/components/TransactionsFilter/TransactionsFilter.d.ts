import type { SortedOptions } from '../../hook';
interface TransactionsFilterProps {
    sortOptions: SortedOptions;
    handleSort: (field: SortedOptions['sort']) => void;
}
export declare const TransactionsFilter: (({ handleSort, sortOptions, }: TransactionsFilterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
