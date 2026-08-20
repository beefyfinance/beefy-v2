import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token';
import { type CssStyles } from '@repo/styles/css';
export type TokenAmountProps = {
    amount: BigNumber;
    decimals: number;
    css?: CssStyles;
    onClick?: () => void;
    disableTooltip?: boolean;
};
export declare const TokenAmount: (({ amount, decimals, css: cssProp, onClick, disableTooltip, }: TokenAmountProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TokenAmountFromEntityProps = Omit<TokenAmountProps, 'decimals'> & {
    token: TokenEntity;
};
export declare const TokenAmountFromEntity: (({ token, ...rest }: TokenAmountFromEntityProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
