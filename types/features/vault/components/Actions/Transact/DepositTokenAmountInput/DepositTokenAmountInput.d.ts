import { type CssStyles } from '@repo/styles/css';
import type { TokenEntity } from '../../../../../data/entities/token';
export type DepositTokenAmountInputProps = {
    index: number;
    token: TokenEntity;
    css?: CssStyles;
};
export declare const DepositTokenAmountInput: (({ index, token, css: cssProp, }: DepositTokenAmountInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
