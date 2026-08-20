import { type ButtonHTMLAttributes } from 'react';
export type WalletButtonProps = {
    initializing: boolean;
    connected: boolean;
    known: boolean;
    error: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export declare const WalletButton: (({ initializing, connected, known, error, children, ...rest }: WalletButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
