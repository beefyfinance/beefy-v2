import type { VaultEntity } from '../../../../../data/entities/vault';
interface VaultTransactionsProps {
    vaultId: VaultEntity['id'];
    address: string;
}
export declare const VaultTransactions: (({ vaultId, address, }: VaultTransactionsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
