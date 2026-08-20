import { type ReactNode } from 'react';
type AddressProps = {
    address: string;
    addressLabel?: string;
};
type HeaderProps = {
    children?: ReactNode;
} & AddressProps;
export declare const Header: (({ children, ...addressProps }: HeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
