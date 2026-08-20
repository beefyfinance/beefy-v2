import type { ChainEntity } from '../../../../../../../data/entities/chain';
type ClaimProps = {
    chainId: ChainEntity['id'];
    withChain?: boolean;
};
export declare const Claim: (({ chainId, withChain }: ClaimProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
