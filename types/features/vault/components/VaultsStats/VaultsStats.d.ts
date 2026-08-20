import { type VaultEntity } from '../../../data/entities/vault';
declare function VaultsStatsComponent({ vaultId }: {
    vaultId: VaultEntity['id'];
}): import("react/jsx-runtime").JSX.Element;
export declare const VaultsStats: typeof VaultsStatsComponent & {
    displayName?: string;
};
export {};
