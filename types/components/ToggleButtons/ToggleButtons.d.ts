import type { ReactNode } from 'react';
import { type ButtonVariantProps } from './Button';
import { type ButtonsVariantProps } from './Buttons';
export type ToggleButtonItem<T extends string = string> = {
    value: T;
    label: string;
    subtitle?: string;
};
export type ToggleButtonsProps<TValue extends string = string, TUntoggle extends string = TValue> = {
    value: TValue;
    options: Array<ToggleButtonItem<TValue>>;
    onChange: (value: TValue | TUntoggle) => void;
    /** set this to 'all' key */
    untoggleValue?: TValue | TUntoggle;
    noPadding?: boolean;
    noBorder?: boolean;
    disabled?: boolean;
} & ButtonsVariantProps;
export declare const ToggleButtons: (<TValue extends string = string, TUntoggle extends string = TValue>({ value, options, fullWidth, onChange, untoggleValue, variant, noBackground, noPadding, noBorder, disabled, }: ToggleButtonsProps<TValue, TUntoggle>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ToggleButtonProps<TValue extends string = string> = {
    value: TValue;
    label: ReactNode;
    onClick: (value: TValue) => void;
    disabled?: boolean;
} & ButtonVariantProps;
export declare const ToggleButton: (<TValue extends string = string>({ value, label, onClick, disabled, ...rest }: ToggleButtonProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
