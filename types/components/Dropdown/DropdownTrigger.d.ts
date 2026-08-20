import { type ComponentProps, type ReactHTML } from 'react';
type HtmlTag = keyof ReactHTML;
declare function createDropdownTrigger<T extends HtmlTag>(tag: T): {
    ({ ref, ...props }: ComponentProps<T>): import("react").DetailedReactHTMLElement<import("react").HTMLAttributes<HTMLElement>, HTMLElement>;
    displayName: string;
} & {
    displayName?: string;
};
type DropdownTriggerFactory = {
    [K in HtmlTag]: ReturnType<typeof createDropdownTrigger<K>>;
};
export declare const DropdownTrigger: DropdownTriggerFactory;
export declare const DropdownButtonTrigger: import("@repo/styles/jsx").StyledComponent<{
    ({ ref, ...props }: import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>): import("react").DetailedReactHTMLElement<import("react").HTMLAttributes<HTMLElement>, HTMLElement>;
    displayName: string;
} & {
    displayName?: string;
}, {
    size?: "sm" | "md" | "lg" | "xs" | undefined;
    borderless?: boolean | undefined;
    fullWidth?: boolean | undefined;
    variant?: "boost" | "filter" | "default" | "middle" | "transparent" | "recovery" | "dark" | "light" | "cta" | undefined;
}>;
export {};
