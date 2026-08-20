import type { VaultErc4626 } from '../../../../../data/entities/vault';
export type PendingWithdrawRequestsProps = {
    vaultId: VaultErc4626['id'];
};
export declare const PendingWithdrawRequests: (({ vaultId, }: PendingWithdrawRequestsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
