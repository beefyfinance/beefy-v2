import type { VaultEntity } from '../../features/data/entities/vault';
type VaultDepositedProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultDeposited: (({ vaultId }: VaultDepositedProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
