import { type VaultEntity } from '../../../../../../../../data/entities/vault';
interface VaultDashboardMobileStatsProps {
    vaultId: VaultEntity['id'];
    address: string;
}
export declare const VaultDashboardMobileStats: (({ vaultId, address, }: VaultDashboardMobileStatsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
