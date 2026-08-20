import type { GraphBucket } from '../../../../../../../helpers/graph/types';
import type { VaultEntity } from '../../../../../../data/entities/vault';
export declare const NO_CHART_DATA: {
    data: never[];
    tokens: never[];
    minUsd: number;
    maxUsd: number;
};
export declare const useFeesChartData: (timeBucket: GraphBucket, vaultId: VaultEntity["id"], address?: string) => {
    chartData: {
        data: import("../../../../../../../helpers/graph/timeseries").ClmInvestorFeesTimeSeriesPoint[];
        tokens: import("../../../../../../data/entities/token").TokenEntity[];
        minUsd: number;
        maxUsd: number;
    };
    isLoading: boolean;
};
/**
 * The indexes of the array returned are used to index FEES_TIME_BUCKET
 */
export declare const useVaultPeriodsFeesGraph: (vaultId: VaultEntity["id"], address: string, minHours?: number) => string[];
