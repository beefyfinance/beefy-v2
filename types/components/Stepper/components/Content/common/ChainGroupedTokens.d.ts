import type BigNumber from 'bignumber.js';
type ChainGroupedTokensProps = {
    items: {
        amount: BigNumber;
        token: {
            decimals: number;
            symbol: string;
        };
        chainName: string;
    }[];
};
export declare function ChainGroupedTokens({ items }: ChainGroupedTokensProps): import("react/jsx-runtime").JSX.Element;
export {};
