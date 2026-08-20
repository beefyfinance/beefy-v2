import { type VaultCowcentrated, type VaultEntity, type VaultStandardCowcentrated } from '../../features/data/entities/vault';
type LastHarvestProps = {
    vaultId: VaultEntity['id'];
};
export declare const LastHarvest: (({ vaultId }: LastHarvestProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export declare const LastHarvestStandard: (({ vaultId, }: LastHarvestProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type LastHarvestCowcentratedProps = {
    vaultId: VaultStandardCowcentrated['id'];
    clmId: VaultCowcentrated['id'];
};
export declare const LastHarvestCowcentratedVault: (({ vaultId, clmId, }: LastHarvestCowcentratedProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
