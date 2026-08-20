import type { GraphBucket } from '../../../../../helpers/graph/types';
import { type VaultEntity } from '../../../../data/entities/vault';
export declare const NO_CHART_DATA: {
    data: never[];
    minUnderlying: number;
    maxUnderlying: number;
    minUsd: number;
    maxUsd: number;
};
export declare const usePnLChartData: (timeBucket: GraphBucket, vaultId: VaultEntity["id"], address?: string) => {
    chartData: {
        data: import("../../../../../helpers/graph/timeseries").PriceTsRow[];
        minUnderlying: number;
        maxUnderlying: number;
        minUsd: number;
        maxUsd: number;
    };
    isLoading: boolean;
    willRetry: boolean;
};
/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export declare const useVaultPeriods: (vaultId: VaultEntity["id"], address: string, minHours?: number) => string[];
