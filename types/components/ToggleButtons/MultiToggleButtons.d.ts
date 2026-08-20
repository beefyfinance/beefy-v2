import { type FC } from 'react';
import type { ToggleButtonProps, ToggleButtonsProps } from './ToggleButtons';
export type MultiToggleButtonProps<TValue extends string = string> = Omit<ToggleButtonProps<TValue>, 'onClick'> & {
    onClick: (isSelected: boolean, value: TValue) => void;
};
export declare const MultiToggleButton: (<TValue extends string = string>({ value, label, onClick, ...rest }: MultiToggleButtonProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type MultiToggleButtonsProps<TValue extends string = string> = Omit<ToggleButtonsProps<TValue>, 'value' | 'onChange' | 'untoggleValue'> & {
    value: TValue[];
    onChange: (value: TValue[]) => void;
    ButtonComponent?: FC<MultiToggleButtonProps<TValue>>;
};
export declare const MultiToggleButtons: (<TValue extends string = string>({ value, options, fullWidth, onChange, variant, ButtonComponent, }: MultiToggleButtonsProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
