export declare const selectIsZapLoaded: ((state: import("../../store/types").BeefyState) => boolean) & {
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
    dependencies: [import("../data-loader-helpers").GlobalDataSelectorFn<boolean>, import("../data-loader-helpers").GlobalDataSelectorFn<boolean>, import("../data-loader-helpers").GlobalDataSelectorFn<boolean>, import("../data-loader-helpers").GlobalDataSelectorFn<boolean>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectShouldInitZapConfigs: import("../data-loader-helpers").GlobalDataSelectorFn<boolean>;
export declare const selectShouldInitZapSwapAggregators: import("../data-loader-helpers").GlobalDataSelectorFn<boolean>;
export declare const selectShouldInitZapAggregatorTokenSupport: import("../data-loader-helpers").GlobalDataSelectorFn<boolean>;
export declare const selectShouldInitZapAmms: import("../data-loader-helpers").GlobalDataSelectorFn<boolean>;
