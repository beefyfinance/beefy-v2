import type { ReactNode } from 'react';
import type { StyledVariantProps } from '@repo/styles/types';
export type SortColumnHeaderProps<TValue extends string = string> = {
    label: string;
    sortKey: TValue;
    sorted: 'none' | 'asc' | 'desc';
    onChange?: (field: TValue) => void;
    before?: ReactNode;
} & StyledVariantProps<typeof SortColumn>;
export declare const SortColumnHeader: (<TValue extends string = string>({ label, sortKey, sorted, onChange, before, ...rest }: SortColumnHeaderProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
declare const SortColumn: import("@repo/styles/types").StyledComponent<"div", {
    show?: "md" | "lg" | undefined;
    align?: "left" | "right" | undefined;
    selected?: boolean | undefined;
}>;
export {};
