import type { GraphBucket } from '../../../helpers/graph/types';
import type { ChartStat } from '../../vault/components/HistoricGraph/types';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
export declare function useOracleIdToUsdPrices(oracleId: TokenEntity['oracleId'], bucket: GraphBucket): {
    data: import("../apis/beefy/beefy-data-api-types").ApiChartData | undefined;
    loading: boolean;
    alreadyFulfilled: boolean;
    hasData: boolean;
    willRetry: boolean;
};
/**
 * Price of underlying token (vault.want) for gov/standard vaults
 * Price of share token for cowcentrated vaults
 */
export declare function useVaultIdToUnderlyingUsdPrices(vaultId: VaultEntity['id'], bucket: GraphBucket): {
    data: import("../apis/beefy/beefy-data-api-types").ApiChartData | undefined;
    loading: boolean;
    alreadyFulfilled: boolean;
    hasData: boolean;
    willRetry: boolean;
};
export declare function useHistoricalStatLoader(stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): {
    loading: boolean;
    alreadyFulfilled: boolean;
    hasData: boolean;
    willRetry: boolean;
};
