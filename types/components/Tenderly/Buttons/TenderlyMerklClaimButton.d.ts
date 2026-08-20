import type { ChainEntity } from '../../../features/data/entities/chain';
export type TenderlyMerklClaimButtonProps = {
    chainId: ChainEntity['id'];
    disabled?: boolean;
};
export declare const TenderlyMerklClaimButton: (({ chainId, disabled, }: TenderlyMerklClaimButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
