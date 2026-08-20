import { type NavLinkProps as RouterNavLinkProps } from 'react-router';
import type { ReactNode } from 'react';
export declare const NavItem: import("@repo/styles/jsx").StyledComponent<"div", {
    readonly mobile?: boolean | undefined;
    readonly dropdownItem?: boolean | undefined;
}>;
export declare const DropdownNavButton: import("@repo/styles/jsx").StyledComponent<{
    ({ ref, ...props }: import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>): import("react").DetailedReactHTMLElement<import("react").HTMLAttributes<HTMLElement>, HTMLElement>;
    displayName: string;
} & {
    displayName?: string;
}, {
    active?: boolean | undefined;
    mobile?: boolean | undefined;
    dropdownItem?: boolean | undefined;
}>;
type NavLinkProps = {
    onClick?: RouterNavLinkProps['onClick'];
    to: RouterNavLinkProps['to'];
    children: ReactNode;
    mobile?: boolean;
    end?: boolean;
    dropdownItem?: boolean;
    externalLink?: boolean;
};
export declare const NavLink: import("react").NamedExoticComponent<NavLinkProps>;
export {};
