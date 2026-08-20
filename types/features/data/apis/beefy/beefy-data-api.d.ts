import type { ApiAvgApys, ApiChartData, ApiCowcentratedChartData, ApiRevenueStats, ApiRanges, ApiRevenueStatType, ApiTimeBucket, IBeefyDataApi } from './beefy-data-api-types';
import type { VaultEntity } from '../../entities/vault';
import type { TokenEntity } from '../../entities/token';
import type { ChainEntity } from '../../entities/chain';
export declare class BeefyDataApi implements IBeefyDataApi {
    private readonly version;
    private readonly data;
    constructor();
    getAvailableRanges(vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], vaultAddress?: VaultEntity['contractAddress'], chainId?: ChainEntity['id']): Promise<ApiRanges>;
    getApyChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData>;
    getPriceChartData(oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): Promise<ApiChartData>;
    getTvlChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData>;
    getCowcentratedRangesChartData(vaultAddress: VaultEntity['contractAddress'], bucket: ApiTimeBucket, chainId: ChainEntity['id']): Promise<ApiCowcentratedChartData>;
    getAvgApys(): Promise<ApiAvgApys>;
    getRevenueStatsByPeriod(statType: ApiRevenueStatType): Promise<ApiRevenueStats>;
    private getChartData;
}
