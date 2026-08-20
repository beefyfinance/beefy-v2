import type BigNumber from 'bignumber.js';
import { type VaultEntity } from '../entities/vault';
import type { FilteredVaultsState, SortWithSubSort } from '../reducers/filtered-vaults-types';
import type { BeefyState } from '../store/types';
import type { KeysOfType } from '../utils/types-utils';
export declare const selectFilterOptions: (state: BeefyState) => FilteredVaultsState;
export declare const selectFilterSearchText: (state: BeefyState) => string;
export declare const selectFilterChainIds: (state: BeefyState) => ("ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood")[];
export declare const selectFilterSearchSortField: (state: BeefyState) => import("../reducers/filtered-vaults-types").SortType;
export declare const selectFilterSearchSortDirection: (state: BeefyState) => import("../reducers/filtered-vaults-types").SortDirectionType;
export declare const selectFilterUserCategory: (state: BeefyState) => import("../reducers/filtered-vaults-types").UserCategoryType;
export declare const selectFilterAssetType: (state: BeefyState) => import("../reducers/filtered-vaults-types").VaultAssetType[];
export declare const selectFilterStrategyType: (state: BeefyState) => import("../reducers/filtered-vaults-types").StrategiesType;
export declare const selectFilterVaultCategory: (state: BeefyState) => import("../reducers/filtered-vaults-types").VaultCategoryType[];
export declare const selectFilterPlatformIds: (state: BeefyState) => string[];
export declare const selectFilterAvgApySort: (state: BeefyState) => import("../reducers/filtered-vaults-types").AvgApySortType;
export declare const selectFilterSubSort: <T extends SortWithSubSort>(state: BeefyState, key: T) => import("../reducers/filtered-vaults-types").SubSortsState[T];
export declare const selectFilterBoolean: import("re-reselect").ParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, boolean> & {
    resultFunc: (res1: KeysOfType<FilteredVaultsState, boolean>, res2: FilteredVaultsState) => boolean;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, KeysOfType<FilteredVaultsState, boolean>>, import("re-reselect").ParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, FilteredVaultsState>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: KeysOfType<FilteredVaultsState, boolean>, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, boolean, (res1: KeysOfType<FilteredVaultsState, boolean>, res2: FilteredVaultsState) => boolean, [import("re-reselect").ParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, KeysOfType<FilteredVaultsState, boolean>>, import("re-reselect").ParametricSelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>, FilteredVaultsState>]>;
    removeMatchingSelector: (state: BeefyState, props: KeysOfType<FilteredVaultsState, boolean>, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, KeysOfType<FilteredVaultsState, boolean>>;
};
export declare const selectFilterBigNumber: import("re-reselect").ParametricSelector<BeefyState, "minimumUnderlyingTvl", BigNumber> & {
    resultFunc: (res1: "minimumUnderlyingTvl", res2: FilteredVaultsState) => BigNumber;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, "minimumUnderlyingTvl", "minimumUnderlyingTvl">, import("re-reselect").ParametricSelector<BeefyState, "minimumUnderlyingTvl", FilteredVaultsState>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: "minimumUnderlyingTvl", ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, "minimumUnderlyingTvl", BigNumber, (res1: "minimumUnderlyingTvl", res2: FilteredVaultsState) => BigNumber, [import("re-reselect").ParametricSelector<BeefyState, "minimumUnderlyingTvl", "minimumUnderlyingTvl">, import("re-reselect").ParametricSelector<BeefyState, "minimumUnderlyingTvl", FilteredVaultsState>]>;
    removeMatchingSelector: (state: BeefyState, props: "minimumUnderlyingTvl", ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, "minimumUnderlyingTvl">;
};
export declare const selectFilterPopinFilterCount: ((state: BeefyState) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: FilteredVaultsState) => number;
    memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [(state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectHasActiveFilterExcludingUserCategoryAndSort: ((state: BeefyState) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: FilteredVaultsState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectHasActiveFilter: ((state: BeefyState) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: FilteredVaultsState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: FilteredVaultsState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: BeefyState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: FilteredVaultsState) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [(state: BeefyState) => FilteredVaultsState];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultCategory: ((state: BeefyState) => import("../reducers/filtered-vaults-types").VaultCategoryType[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: FilteredVaultsState) => import("../reducers/filtered-vaults-types").VaultCategoryType[];
    memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => import("../reducers/filtered-vaults-types").VaultCategoryType[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../reducers/filtered-vaults-types").VaultCategoryType[];
    dependencies: [(state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare function selectVaultMatchesText(state: BeefyState, vault: VaultEntity, searchText: string): boolean;
export declare const selectUserDashboardFilteredVaults: (state: BeefyState, text: string, walletAddress?: string) => (({
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
}))[];
export declare function selectFilterPlatformIdsForVault(state: BeefyState, vault: VaultEntity): string[];
export declare const selectFilteredVaults: (state: BeefyState) => string[];
export declare const selectFilteredVaultCount: ((state: BeefyState) => number) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[]) => number;
    memoizedResultFunc: ((resultFuncArgs_0: string[]) => number) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number;
    dependencies: [(state: BeefyState) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTotalVaultCount: (state: BeefyState) => number;
/** standard boost, off chain boost, or anything with boostedTotalDaily entry */
export declare const selectVaultIsBoostedForFilter: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectAnyDesktopExtenderFilterIsActive: ((state: BeefyState) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: FilteredVaultsState) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectFilterContent: ((state: BeefyState) => import("../reducers/filtered-vaults-types").FilterContent) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: FilteredVaultsState) => import("../reducers/filtered-vaults-types").FilterContent;
    memoizedResultFunc: ((resultFuncArgs_0: FilteredVaultsState) => import("../reducers/filtered-vaults-types").FilterContent) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../reducers/filtered-vaults-types").FilterContent;
    dependencies: [(state: BeefyState) => FilteredVaultsState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsVaultBlueChip: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => boolean];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsVaultStable: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => boolean];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsVaultCorrelated: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => boolean];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsVaultMeme: ((state: BeefyState, vaultId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => boolean];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectMaximumUnderlyingVaultTvl: (state: BeefyState) => BigNumber;
