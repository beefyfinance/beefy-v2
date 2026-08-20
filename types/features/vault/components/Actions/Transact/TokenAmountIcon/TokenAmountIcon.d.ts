import { type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../../data/entities/token';
export type TokenAmountIconProps = {
    amount: BigNumber;
    tokenAddress: TokenEntity['address'];
    chainId: TokenEntity['chainId'];
    css?: CssStyles;
    showSymbol?: boolean;
    tokenImageSize?: number;
    amountWithValueCss?: CssStyles;
    variant?: 'card' | 'bare';
    /** icon+symbol on left instead of right */
    reverse?: boolean;
};
export declare const TokenAmountIcon: (({ amount, tokenAddress, chainId, css: cssProp, showSymbol, tokenImageSize, amountWithValueCss, variant, reverse, }: TokenAmountIconProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TokenAmountIconLoaderProps = Pick<TokenAmountIconProps, 'css' | 'showSymbol' | 'tokenImageSize' | 'amountWithValueCss' | 'variant' | 'reverse'>;
export declare const TokenAmountIconLoader: (({ tokenImageSize, ...rest }: TokenAmountIconLoaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
