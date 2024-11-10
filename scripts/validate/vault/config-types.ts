import type { VaultConfig } from '../../../src/features/data/apis/config-types';

export type VaultStandardConfig = Omit<VaultConfig, 'type'> & { type: 'standard' };
export type VaultGovConfig = Omit<VaultConfig, 'type'> & { type: 'gov' };
export type VaultCowcentratedConfig = Omit<VaultConfig, 'type'> & { type: 'cowcentrated' };

export type VaultConfigsByType = {
  standard?: VaultStandardConfig[];
  gov?: VaultGovConfig[];
  cowcentrated?: VaultCowcentratedConfig[];
};
