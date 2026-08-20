import type { TransactOption, TransactQuote } from '../../../features/data/apis/transact/transact-types';
export type TenderlyTransactButtonProps = {
    option: TransactOption;
    quote: TransactQuote;
};
export declare const TenderlyTransactButton: (({ option, quote, }: TenderlyTransactButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
