import type { ChainEntity } from '../../../../../data/entities/chain';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
type ClaimProps = {
    boostId: BoostPromoEntity['id'];
    chainId: ChainEntity['id'];
    disabled?: boolean;
};
export declare const Claim: (({ boostId, chainId, disabled }: ClaimProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
