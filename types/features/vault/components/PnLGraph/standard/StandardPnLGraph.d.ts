import { type VaultEntity } from '../../../../data/entities/vault';
interface PnLGraphLoaderProps {
    vaultId: VaultEntity['id'];
    address?: string;
}
export declare const StandardPnLGraphLoader: (({ vaultId, address, }: PnLGraphLoaderProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
interface PnLGraphProps {
    vaultId: VaultEntity['id'];
    address: string;
}
export declare const StandardPnLGraph: (({ vaultId, address, }: PnLGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const DashboardPnLGraph: (({ vaultId, address, }: PnLGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
