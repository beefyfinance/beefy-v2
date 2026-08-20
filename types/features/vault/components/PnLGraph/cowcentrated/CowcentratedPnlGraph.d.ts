import { type VaultEntity } from '../../../../data/entities/vault';
interface CowcentratedPnlGraphLoaderProps {
    vaultId: VaultEntity['id'];
    address?: string;
}
export declare const CowcentratedPnlGraphLoader: (({ vaultId, address, }: CowcentratedPnlGraphLoaderProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
interface CowcentratedPnlGraphProps {
    vaultId: VaultEntity['id'];
    address: string;
}
export declare const OverviewGraph: (({ vaultId, address, }: CowcentratedPnlGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const FeesGraph: (({ vaultId, address }: CowcentratedPnlGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const CowcentratedPnlGraph: (({ vaultId, address, }: CowcentratedPnlGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const DashboardOverviewGraph: (({ vaultId, address, }: CowcentratedPnlGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const DashboardFeesGraph: (({ vaultId, address, }: CowcentratedPnlGraphProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
