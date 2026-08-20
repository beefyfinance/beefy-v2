import { type TimelineEntryCowcentratedPool, type TimelineEntryCowcentratedVault, type TimelineEntryStandard } from '../../../../../data/entities/analytics';
import type { VaultEntity } from '../../../../../data/entities/vault';
export type SortedOptions = {
    sort: 'datetime' | 'amount' | 'balance' | 'mooTokenBal' | 'usdBalance';
    sortDirection: 'asc' | 'desc';
};
type VaultTransactionHistory = {
    sortedOptions: SortedOptions;
    handleSort: (field: SortedOptions['sort']) => void;
    sortedTimeline: (TimelineEntryStandard | TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault)[];
};
export declare function useSortedTransactionHistory(vaultId: VaultEntity['id'], address: string): VaultTransactionHistory;
export {};
