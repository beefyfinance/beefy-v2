import type { VaultEntity } from '../../../../../data/entities/vault';
interface TableStatsInterface {
    vaultId: VaultEntity['id'];
    address: string;
}
export declare const TabletStats: (({ vaultId, address }: TableStatsInterface) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
