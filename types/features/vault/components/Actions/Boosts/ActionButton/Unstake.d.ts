import type { ChainEntity } from '../../../../../data/entities/chain';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
type UnstakeProps = {
    boostId: BoostPromoEntity['id'];
    chainId: ChainEntity['id'];
    disabled?: boolean;
    canClaim: boolean;
};
export declare const Unstake: (({ boostId, chainId, disabled, canClaim }: UnstakeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
