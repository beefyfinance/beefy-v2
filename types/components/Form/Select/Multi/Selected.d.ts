import type { SelectItem } from '../types';
export declare const Selected: (<TItem extends SelectItem = SelectItem>(props: Omit<{
    size?: "sm" | "md" | "lg" | "xs" | undefined;
    borderless?: boolean | undefined;
    fullWidth?: boolean | undefined;
    variant?: "boost" | "filter" | "default" | "middle" | "transparent" | "recovery" | "dark" | "light" | "cta" | undefined;
}, "active" | "ButtonComponent" | "labelPrefix" | "unselectedLabel" | "getProps" | "LabelComponent" | "LabelPrefixComponent"> & {
    labelPrefix?: string;
    unselectedLabel: string;
    active: boolean;
    getProps: (props?: import("../types").ButtonProps) => import("../types").ButtonProps;
    ButtonComponent: import("../../../../features/data/utils/types-utils").FCWithRef<import("../types").CommonSelectedButtonProps, HTMLButtonElement>;
    LabelComponent: import("react").FC<import("../types").CommonSelectedLabelProps>;
    LabelPrefixComponent: import("react").FC<import("../types").CommonSelectedLabelPrefixProps>;
} & {
    items?: TItem[] | undefined;
    allSelected: boolean;
    allSelectedLabel?: string;
} & import("react").RefAttributes<HTMLButtonElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
