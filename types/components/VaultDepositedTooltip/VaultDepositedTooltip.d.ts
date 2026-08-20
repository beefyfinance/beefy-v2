import type { VaultEntity } from '../../features/data/entities/vault';
export type VaultDepositedTooltipProps = {
    vaultId: VaultEntity['id'];
    walletAddress?: string;
};
export declare const VaultDepositedTooltip: (({ vaultId, walletAddress, }: VaultDepositedTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
