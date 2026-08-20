import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
export type AmountInputProps = {
    value: BigNumber;
    maxValue: BigNumber;
    tokenDecimals?: number;
    onChange?: (value: BigNumber, isMax: boolean) => void;
    error?: boolean;
    warning?: boolean;
    css?: CssStyles;
    allowInputAboveBalance?: boolean;
    fullWidth?: boolean;
    price?: BigNumber;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    disabled?: boolean;
    errorCss?: CssStyles;
    warningCss?: CssStyles;
};
export declare const AmountInput: (({ value, maxValue, onChange, tokenDecimals, error, warning, css: cssProp, allowInputAboveBalance, fullWidth, price, endAdornment, startAdornment, disabled, errorCss, warningCss, }: AmountInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
