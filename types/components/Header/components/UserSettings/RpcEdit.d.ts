import type { ChainEntity } from '../../../../features/data/entities/chain';
export interface RpcEditProps {
    chainId: ChainEntity['id'];
    onBack: () => void;
}
export declare const RpcEdit: (({ chainId, onBack }: RpcEditProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const ChainRpcReset: (({ value: chain, onBack, }: {
    onBack: () => void;
    value: ChainEntity["id"];
}) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
