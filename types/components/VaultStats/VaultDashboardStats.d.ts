import { type VaultEntity } from '../../features/data/entities/vault';
export type VaultStatsProps = {
    vaultId: VaultEntity['id'];
    address: string;
};
export declare const VaultDashboardStats: (({ vaultId, address }: VaultStatsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
