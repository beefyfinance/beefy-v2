import type { VaultEntity } from '../../features/data/entities/vault';
export type VaultStatsProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultStats: (({ vaultId }: VaultStatsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
