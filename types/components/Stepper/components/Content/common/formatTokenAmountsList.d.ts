import type BigNumber from 'bignumber.js';
export declare function formatTokenAmountsList(items: {
    amount: BigNumber;
    token: {
        decimals: number;
        symbol: string;
    };
}[]): import("react/jsx-runtime").JSX.Element;
