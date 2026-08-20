import type { VaultFee } from '../../../../../data/reducers/fees-types';
export type PerformanceFeesProps = {
    fees: VaultFee;
};
export declare const PerformanceFees: (({ fees }: PerformanceFeesProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
