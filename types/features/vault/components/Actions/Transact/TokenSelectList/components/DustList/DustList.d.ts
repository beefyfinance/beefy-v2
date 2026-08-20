import { type ReactNode } from 'react';
export type DustListProps = {
    children: ReactNode;
    dustTotalUsd: BigNumber;
    /** i18n key for the low-value items label (e.g. tokens vs vaults). Defaults to tokens. */
    labelKey?: string;
};
export declare const DustList: (({ children, dustTotalUsd, labelKey, }: DustListProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
