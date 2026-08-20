import type { VaultEntity } from '../../../data/entities/vault';
interface MigrationProps {
    vaultId: VaultEntity['id'];
}
export declare const Migration: (({ vaultId }: MigrationProps) => import("react/jsx-runtime").JSX.Element[] | null) & {
    displayName?: string;
};
export {};
