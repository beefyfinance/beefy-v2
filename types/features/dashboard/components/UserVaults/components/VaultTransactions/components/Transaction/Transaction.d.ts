import { type TimelineEntryCowcentratedPool, type TimelineEntryCowcentratedVault, type TimelineEntryStandard } from '../../../../../../../data/entities/analytics';
type TransactionProps = {
    tx: TimelineEntryStandard | TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault;
};
export declare const Transaction: (({ tx }: TransactionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const TransactionMobile: (({ tx }: TransactionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
