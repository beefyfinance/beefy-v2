import type { VaultEntity } from '../../../data/entities/vault';
export type UserVaultsProps = {
    address: string;
};
export declare const UserVaults: (({ address }: UserVaultsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type VirtualListProps = {
    vaultIds: VaultEntity['id'][];
    address: string;
};
export declare const VirtualList: (({ vaultIds, address }: VirtualListProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
