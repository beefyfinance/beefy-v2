import type { ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type LabelledCheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
    containerCss?: CssStyles;
    iconCss?: CssStyles;
    labelCss?: CssStyles;
    checkedIconCss?: CssStyles;
    checkVariant?: 'square' | 'circle';
    endAdornment?: ReactNode;
};
export declare const LabelledCheckbox: (({ checked, onChange, label, iconCss, labelCss, checkedIconCss, checkVariant, endAdornment, containerCss, }: LabelledCheckboxProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
