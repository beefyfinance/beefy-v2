import { type ReactNode } from 'react';
import { type AmountInputProps } from '../AmountInput/AmountInput';
type AmountInputWithSliderProps = AmountInputProps & {
    endAdornment?: ReactNode;
    warning?: boolean;
};
export declare const AmountInputWithSlider: (({ value, maxValue, onChange, tokenDecimals, css: cssProp, price, endAdornment, warning, }: AmountInputWithSliderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
