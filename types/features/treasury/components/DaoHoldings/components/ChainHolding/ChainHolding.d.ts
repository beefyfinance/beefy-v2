import type { ChainEntity } from '../../../../../data/entities/chain';
interface ChainHoldingProps {
    chainId: ChainEntity['id'];
}
export declare const ChainHolding: (({ chainId }: ChainHoldingProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
