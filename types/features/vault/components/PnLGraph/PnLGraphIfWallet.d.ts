import { type VaultEntity } from '../../../data/entities/vault';
type PnLGraphIfWalletProps = {
    vaultId: VaultEntity['id'];
    walletAddress?: string;
};
export declare const PnLGraphIfWallet: (({ vaultId, walletAddress, }: PnLGraphIfWalletProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
type PnLGraphProps = {
    vaultId: VaultEntity['id'];
    walletAddress: string;
};
export declare const PnLGraph: (({ vaultId, walletAddress }: PnLGraphProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
