import type { ApyPerformanceFeeData, ApyVaultFeeData } from '../apis/beefy/beefy-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';

export type VaultFee = {
  id: VaultEntity['id'];
  withdraw: ApyVaultFeeData['withdraw'];
  deposit: ApyVaultFeeData['deposit'] | undefined;
} & ApyPerformanceFeeData;
export type FeesState = NormalizedEntity<VaultFee>;
