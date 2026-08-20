import type { ChartApiPoint, ChartStat } from '../../vault/components/HistoricGraph/types';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { TokenEntity } from '../entities/token';
import type { VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare function selectHistoricalRangesStatus(state: BeefyState, vaultId: VaultEntity['id']): "idle" | "pending" | "fulfilled" | "rejected";
export declare const selectHistoricalHasAnyChart: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [typeof selectHistoricalHasApyChart, typeof selectHistoricalHasTvlChart, typeof selectHistoricalHasPriceChart, typeof selectHistoricalHasCowcentratedRanges];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare function selectHistoricalHasApyChart(state: BeefyState, vaultId: VaultEntity['id']): boolean;
export declare function selectHistoricalHasTvlChart(state: BeefyState, vaultId: VaultEntity['id']): boolean;
export declare function selectHistoricalHasPriceChart(state: BeefyState, oracleId: TokenEntity['oracleId']): boolean;
export declare function selectHistoricalHasCowcentratedRanges(state: BeefyState, vaultId: VaultEntity['id']): boolean;
export declare const selectHistoricalAvailableCharts: ((state: BeefyState, _vaultId: string, oracleId: string) => ChartStat[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => ChartStat[];
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean) => ChartStat[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => ChartStat[];
    dependencies: [(state: BeefyState, _vaultId: VaultEntity["id"], oracleId: TokenEntity["oracleId"]) => boolean, typeof selectHistoricalHasApyChart, typeof selectHistoricalHasTvlChart, import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
        resultFunc: (res: ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        })) => boolean;
        dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        })>];
        recomputations: () => number;
        resetRecomputations: () => number;
    } & {
        getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res: ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        })) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultStandardBaseOnly & {
            subType: "standard";
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "standard";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultStandardBaseOnly & {
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "single";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultGovBaseOnly & {
            subType: "gov";
            contractType: "multi";
            receiptTokenAddress: string;
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "gov";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & import("../entities/vault").VaultGovBaseOnly & {
            receiptTokenAddress: string;
            contractType: "multi";
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "cowcentrated";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultCowcentratedBaseOnly & {
            subType: "cowcentrated";
            receiptTokenAddress: string;
            depositTokenAddress: string;
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultActive & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultRetired & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        }) | ({
            type: "erc4626";
        } & import("../entities/vault").VaultBase & import("../entities/vault").VaultPaused & import("../entities/vault").VaultErc4626BaseOnly & {
            subType: "erc7540:withdraw";
        })>]>;
        removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
        clearCache: () => void;
        cache: import("re-reselect").ICacheObject;
        keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
    }, (state: BeefyState, vaultId: VaultEntity["id"], _oracleId: TokenEntity["oracleId"]) => boolean];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare function selectHistoricalApyBucketStatus(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): "idle" | "pending" | "fulfilled" | "rejected";
export declare function selectHistoricalTvlBucketStatus(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): "idle" | "pending" | "fulfilled" | "rejected";
export declare function selectHistoricalPriceBucketStatus(state: BeefyState, oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): "idle" | "pending" | "fulfilled" | "rejected";
export declare function selectHistoricalCowcentratedRangesBucketStatus(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): "idle" | "pending" | "fulfilled" | "rejected";
export declare function selectHistoricalApyBucketData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): import("../apis/beefy/beefy-data-api-types").ApiChartData | undefined;
export declare function selectHistoricalTvlBucketData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): import("../apis/beefy/beefy-data-api-types").ApiChartData | undefined;
export declare function selectHistoricalPriceBucketData(state: BeefyState, oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): import("../apis/beefy/beefy-data-api-types").ApiChartData | undefined;
export declare function selectHistoricalCowcentratedRangesBucketData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): import("../apis/beefy/beefy-data-api-types").ApiCowcentratedChartData | undefined;
export declare function selectHistoricalPriceAvailableBuckets(state: BeefyState, oracleId: TokenEntity['oracleId']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalApyAvailableBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalTvlAvailableBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalCowcentratedRangesAvailableBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalPriceHasDataBuckets(state: BeefyState, oracleId: TokenEntity['oracleId']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalApyHasDataBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalTvlHasDataBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalCowcentratedRangesHasDataBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalPriceAlreadyFulfilledBuckets(state: BeefyState, oracleId: TokenEntity['oracleId']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalApyAlreadyFulfilledBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalTvlAlreadyFulfilledBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalCowcentratedRangesAlreadyFulfilledBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalPriceLastDispatchBuckets(state: BeefyState, oracleId: TokenEntity['oracleId']): Record<ApiTimeBucket, number>;
export declare function selectHistoricalApyLastDispatchBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, number>;
export declare function selectHistoricalTvlLastDispatchBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, number>;
export declare function selectHistoricalCowcentratedRangesLastDispatchBuckets(state: BeefyState, vaultId: VaultEntity['id']): Record<ApiTimeBucket, number>;
export declare function selectHistoricalPriceBucketHasData(state: BeefyState, oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalApyBucketHasData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalTvlBucketHasData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalCowcentratedRangesBucketHasData(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalPriceBucketAlreadyFulfilled(state: BeefyState, oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalApyBucketAlreadyFulfilled(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalTvlBucketAlreadyFulfilled(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalCowcentratedRangesBucketAlreadyFulfilled(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalPriceBucketDispatchedRecently(state: BeefyState, oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket, recentSeconds?: number): boolean;
export declare function selectHistoricalApyBucketDispatchedRecently(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket, recentSeconds?: number): boolean;
export declare function selectHistoricalTvlBucketDispatchedRecently(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket, recentSeconds?: number): boolean;
export declare function selectHistoricalCowcentratedRangesBucketDispatchedRecently(state: BeefyState, vaultId: VaultEntity['id'], bucket: ApiTimeBucket, recentSeconds?: number): boolean;
export declare function selectHistoricalBucketStatus(state: BeefyState, stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): "idle" | "pending" | "fulfilled" | "rejected";
export declare function selectHistoricalAvailableBuckets(state: BeefyState, stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId']): Record<ApiTimeBucket, boolean>;
export declare function selectHistoricalBucketHasData(state: BeefyState, stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalBucketAlreadyFulfilled(state: BeefyState, stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): boolean;
export declare function selectHistoricalBucketDispatchedRecently(state: BeefyState, stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket, recentSeconds?: number): boolean;
type HistoricalBucketData<TStat extends ChartStat> = ChartApiPoint<TStat>[] | undefined;
export declare function selectHistoricalBucketData<TStat extends ChartStat>(state: BeefyState, stat: TStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): HistoricalBucketData<TStat>;
export {};
