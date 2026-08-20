import type { ChainEntity } from '../../../../features/data/entities/chain';
export interface RpcMenuProps {
    onSelect: (chainId: ChainEntity['id']) => void;
    chainsWithErrors: ChainEntity['id'][];
}
export declare const RpcMenu: (({ onSelect, chainsWithErrors }: RpcMenuProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
