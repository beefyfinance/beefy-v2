import { type ReactNode } from 'react';
type ActionButtonProps = {
    onClick: () => void;
    children: ReactNode;
    disabled?: boolean;
    variant?: 'boost' | 'default' | 'cta';
};
export declare const ActionButton: (({ disabled, onClick, children, variant, }: ActionButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
