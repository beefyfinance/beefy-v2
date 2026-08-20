import { type ReactNode } from 'react';
import { type HTMLStyledProps } from '@repo/styles/jsx';
export type DropdownContentProps = {
    children: ReactNode;
} & Omit<HTMLStyledProps<typeof DropdownInner>, 'children' | 'className'>;
export declare const DropdownContent: ((innerProps: DropdownContentProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export declare const DropdownOuter: import("@repo/styles/jsx").StyledComponent<"div", {
    variant?: "button" | "dark" | "light" | undefined;
    layer?: 0 | 1 | 2 | undefined;
}>;
export declare const DropdownInner: import("@repo/styles/jsx").StyledComponent<"div", {
    padding?: "small" | "normal" | "none" | "large" | undefined;
    gap?: "small" | "normal" | "none" | "large" | undefined;
}>;
