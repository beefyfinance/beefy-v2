import { type MouseEventHandler } from 'react';
import type { ChainEntity } from '../../../../../data/entities/chain';
type WithdrawButtonProps = {
    chainId: ChainEntity['id'];
    onClick: MouseEventHandler<HTMLButtonElement> | undefined;
    disabled?: boolean;
};
export declare const WithdrawButton: (({ chainId, onClick, disabled, }: WithdrawButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
