export type SortedOptions = {
    sort: 'atDeposit' | 'now' | 'yield' | 'pnl' | 'apy' | 'dailyYield' | 'default';
    sortDirection: 'asc' | 'desc';
};
export declare function useSortedDashboardVaults(address: string): {
    sortedFilteredVaults: string[];
    sortedOptions: SortedOptions;
    handleSort: (field: SortedOptions["sort"]) => void;
    searchText: string;
    setSearchText: import("react").Dispatch<import("react").SetStateAction<string>>;
};
