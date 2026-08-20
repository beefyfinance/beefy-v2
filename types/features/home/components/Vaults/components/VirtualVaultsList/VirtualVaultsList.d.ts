import type { VaultEntity } from '../../../../../data/entities/vault';
type VirtualVaultsListProps = {
    vaultIds: VaultEntity['id'][];
};
export declare const VirtualVaultsList: (({ vaultIds, }: VirtualVaultsListProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
