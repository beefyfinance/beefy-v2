import type { ReactNode } from 'react';
import type { FilteredVaultBooleanKeys } from '../../../../../data/reducers/filtered-vaults-types';
export type CheckboxFilterProps = {
    filter: FilteredVaultBooleanKeys;
    label: string;
    icon?: ReactNode;
};
export declare const CheckboxFilter: (({ filter, label, icon, }: CheckboxFilterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
