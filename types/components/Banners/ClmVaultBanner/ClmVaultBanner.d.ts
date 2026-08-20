import { type VaultEntity, type VaultGovCowcentrated, type VaultStandardCowcentrated } from '../../../features/data/entities/vault';
export type ClmVaultBannerProps = {
    vaultId: VaultEntity['id'];
};
export declare const ClmVaultBanner: import("react").NamedExoticComponent<ClmVaultBannerProps>;
export type ClmVaultBannerImplProps = {
    pool: VaultGovCowcentrated;
    vaultId: VaultStandardCowcentrated['id'];
};
