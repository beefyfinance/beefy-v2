import type { ChainEntity } from '../../../../../data/entities/chain';
interface BalanceEndAdornmentProps<V extends string = string> {
    value: V;
}
export declare const BalanceEndAdornment: (({ value: chainId, }: BalanceEndAdornmentProps<ChainEntity["id"]>) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
