import { type HTMLStyledProps } from '@repo/styles/jsx';
import { type ReactNode } from 'react';
import type { Override } from '../../../features/data/utils/types-utils';
export type SelectDropdownProps = Override<HTMLStyledProps<typeof Layout>, {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}>;
export declare const SelectDropdown: ((props: Omit<HTMLStyledProps<import("@repo/styles/jsx").StyledComponent<"div", {
    layer?: 0 | 1 | 2 | undefined;
}>>, "children" | "header" | "footer"> & {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
} & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
declare const Layout: import("@repo/styles/jsx").StyledComponent<"div", {
    layer?: 0 | 1 | 2 | undefined;
}>;
export {};
