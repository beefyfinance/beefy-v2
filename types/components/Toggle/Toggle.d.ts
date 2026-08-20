import type { ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type ToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    css?: CssStyles;
};
export declare const Toggle: (({ checked, onChange, startAdornment, endAdornment, css: cssProp, }: ToggleProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
