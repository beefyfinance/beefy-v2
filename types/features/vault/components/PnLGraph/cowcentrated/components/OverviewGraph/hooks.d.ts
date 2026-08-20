import type { GraphBucket } from '../../../../../../../helpers/graph/types';
import { type VaultEntity } from '../../../../../../data/entities/vault';
export declare const usePnLChartData: (timeBucket: GraphBucket, vaultId: VaultEntity["id"], address?: string) => {
    chartData: {
        data: never[];
        minUsd: number;
        maxUsd: number;
        minUnderlying: number;
        maxUnderlying: number;
        type: string;
    } | {
        data: import("../../../../../../../helpers/graph/timeseries").ClmInvestorOverviewTimeSeriesPoint[];
        minUsd: number;
        maxUsd: number;
        minUnderlying: number;
        maxUnderlying: number;
    };
    isLoading: boolean;
    willRetry: boolean;
    type: string;
};
/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export declare const useVaultPeriodsOverviewGraph: (vaultId: VaultEntity["id"], address: string, minHours?: number) => string[];
