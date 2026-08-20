import type { ApyPerformanceFeeData, ApyVaultFeeData } from '../apis/beefy/beefy-api-types';
import type { VaultEntity } from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
export type VaultFee = {
    id: VaultEntity['id'];
    withdraw: ApyVaultFeeData['withdraw'];
    deposit: ApyVaultFeeData['deposit'] | undefined;
} & ApyPerformanceFeeData;
export type FeesState = NormalizedEntity<VaultFee>;
