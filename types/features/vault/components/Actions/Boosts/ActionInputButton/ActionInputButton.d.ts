import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
export interface ActionInputButtonProps {
    boostId: BoostPromoEntity['id'];
    open: boolean;
    onToggle: () => void;
    onSubmit: (amount: BigNumber, max: boolean) => void;
    balance: BigNumber;
    title: string;
    balanceLabel: string;
    buttonLabel: string;
    buttonVariant?: 'default' | 'boost';
}
export declare const ActionInputButton: (({ boostId, open, onToggle, onSubmit, balance, title, balanceLabel, buttonLabel, buttonVariant, }: ActionInputButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
