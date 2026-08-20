import type { ChainId } from '../../../features/data/entities/chain';
export type TenderlyButtonProps = {
    chainId: ChainId;
    onClick: () => void;
    disabled?: boolean;
};
export declare const TenderlyButton: (({ chainId, onClick, disabled, }: TenderlyButtonProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
