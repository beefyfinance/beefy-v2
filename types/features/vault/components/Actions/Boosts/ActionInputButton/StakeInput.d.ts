import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
export type StakeInputProps = {
    boostId: BoostPromoEntity['id'];
    balance: BigNumber;
    open: string | undefined;
    toggleOpen: (mode: 'stake' | 'unstake') => void;
};
export declare const StakeInput: (({ boostId, balance, open, toggleOpen, }: StakeInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
