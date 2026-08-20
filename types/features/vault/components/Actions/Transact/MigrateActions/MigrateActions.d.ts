import type { VaultEntity } from '../../../../../data/entities/vault';
type MigrateActionsProps = {
    oldVaultId: VaultEntity['id'];
    newVaultId: VaultEntity['id'];
};
export declare const MigrateActions: (({ oldVaultId, newVaultId, }: MigrateActionsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
