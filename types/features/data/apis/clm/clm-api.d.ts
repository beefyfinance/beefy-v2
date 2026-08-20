import type { ClmInvestorTimelineResponse, ClmPendingRewardsResponse, ClmPeriod, ClmPriceHistoryEntry, ClmVaultHarvestsResponse, ClmVaultsHarvestsResponse, IClmApi } from './clm-api-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
export declare class ClmApi implements IClmApi {
    clmBase: string;
    constructor();
    getInvestorTimeline(address: string): Promise<ClmInvestorTimelineResponse>;
    getPriceHistoryForVaultSince<T extends ClmPriceHistoryEntry>(chainId: ChainEntity['id'], vaultAddress: VaultEntity['contractAddress'], since: Date, period: ClmPeriod): Promise<T[]>;
    getHarvestsForVault(chainId: ChainEntity['id'], vaultAddress: VaultEntity['contractAddress']): Promise<ClmVaultHarvestsResponse>;
    getHarvestsForVaultsSince(chainId: ChainEntity['id'], vaultAddresses: VaultEntity['contractAddress'][], since: Date): Promise<ClmVaultsHarvestsResponse>;
    getClmPendingRewards(chain: ChainEntity, stratAddress: string, vaultAddress: VaultEntity['contractAddress']): Promise<ClmPendingRewardsResponse>;
}
