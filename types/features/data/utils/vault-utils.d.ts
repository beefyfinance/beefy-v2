import { type VaultCowcentratedLike, type VaultEntity, type VaultNames } from '../entities/vault';
export declare function getVaultNames(configName: string, configType: VaultEntity['type'] | undefined): VaultNames;
export declare function getCowcentratedAddressFromCowcentratedLikeVault(vault: VaultCowcentratedLike): string;
