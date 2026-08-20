import BigNumber from 'bignumber.js';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectIsTokenLoaded: (state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => boolean;
export declare const selectTokenById: (state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => TokenEntity;
export declare const selectTokenByIdOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => TokenEntity | undefined;
export declare const selectTokenByAddress: (state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
export declare const selectTokenByAddressOrUndefined: (state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => TokenEntity | undefined;
export declare const selectTokensByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => {
    byId: {
        [id: string]: TokenEntity["address"];
    };
    byAddress: {
        [address: string]: TokenEntity;
    };
    native: import("../entities/token").TokenNative["id"] | undefined;
    wnative: import("../entities/token").TokenErc20["id"] | undefined;
    interestingBalanceTokenAddresses: TokenEntity["address"][];
    tokenIdsInActiveVaults: TokenEntity["id"][];
};
export declare const selectDepositTokenByVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
/** only if vault has receipt token, and that is a share token (uses price per full share) */
export declare const selectShareTokenByVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative | undefined;
export declare const selectErc20TokenByAddress: (state: BeefyState, chainId: ChainEntity["id"], address: string, mapNativeToWnative?: boolean) => import("../entities/token").TokenErc20;
export declare const selectChainNativeToken: (state: BeefyState, chainId: ChainEntity["id"]) => import("../entities/token").TokenNative;
export declare const selectChainWrappedNativeToken: (state: BeefyState, chainId: ChainEntity["id"]) => import("../entities/token").TokenErc20;
export declare function isTokenStable(token: TokenEntity): boolean;
export declare function isTokenBluechip(token: TokenEntity): boolean;
export declare function isTokenMeme(token: TokenEntity): boolean;
export declare const selectIsTokenStable: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", tokenId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsTokenBluechip: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", tokenId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsTokenMeme: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", tokenId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsTokenStableByAddress: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", address: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsTokenBluechipByAddress: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", address: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsTokenMemeByAddress: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", address: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => TokenEntity | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTokenPriceByAddress: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", address: string) => BigNumber) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity | undefined, resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => BigNumber;
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity | undefined, resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => BigNumber) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => BigNumber;
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], address: TokenEntity["address"]) => TokenEntity | undefined, (state: BeefyState) => {
        [tokenId: string]: BigNumber;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTokenPriceByTokenOracleId: (state: BeefyState, oracleId: TokenEntity["oracleId"]) => BigNumber;
export declare const selectVaultReceiptTokenPrice: (state: BeefyState, vaultId: VaultEntity["id"], ppfs?: BigNumber) => BigNumber;
export declare const selectLpBreakdownByOracleId: (state: BeefyState, oracleId: TokenEntity["oracleId"]) => import("../apis/beefy/beefy-api-types").LpData;
export declare const selectLpBreakdownForVault: (state: BeefyState, vault: VaultEntity) => import("../apis/beefy/beefy-api-types").LpData;
export declare const selectLpBreakdownForVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => import("../apis/beefy/beefy-api-types").LpData;
export declare const selectHasBreakdownDataByOracleId: (state: BeefyState, oracleId: TokenEntity["oracleId"], chainId: ChainEntity["id"]) => boolean;
export declare const selectHasBreakdownDataByTokenAddress: (state: BeefyState, depositTokenAddress: VaultEntity["depositTokenAddress"], chainId: ChainEntity["id"]) => boolean;
export declare const selectHasBreakdownDataForVault: (state: BeefyState, vault: VaultEntity) => boolean;
export declare const selectHasBreakdownDataForVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectIsTokenLoadedOnChain: import("re-reselect").ParametricSelector<BeefyState, string, boolean> & {
    resultFunc: (res1: {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    } | undefined, res2: string) => boolean;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    } | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, boolean, (res1: {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    } | undefined, res2: string) => boolean, [import("re-reselect").ParametricSelector<BeefyState, string, {
        byId: {
            [id: string]: TokenEntity["address"];
        };
        byAddress: {
            [address: string]: TokenEntity;
        };
        native: import("../entities/token").TokenNative["id"] | undefined;
        wnative: import("../entities/token").TokenErc20["id"] | undefined;
        interestingBalanceTokenAddresses: TokenEntity["address"][];
        tokenIdsInActiveVaults: TokenEntity["id"][];
    } | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectWrappedToNativeSymbolMap: (state: BeefyState) => Map<string, string>;
export declare const selectWrappedToNativeSymbolOrTokenSymbol: import("re-reselect").ParametricSelector<BeefyState, string, string> & {
    resultFunc: (res1: Map<string, string>, res2: string) => string;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, Map<string, string>>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string, (res1: Map<string, string>, res2: string) => string, [import("re-reselect").ParametricSelector<BeefyState, string, Map<string, string>>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectPriceWithChange: import("re-reselect").ParametricSelector<BeefyState, string, {
    bucket: ApiTimeBucket;
    price: undefined;
    shouldLoad: boolean;
    previousPrice: undefined;
    previousDate: undefined;
} | {
    bucket: ApiTimeBucket;
    price: BigNumber;
    shouldLoad: boolean;
    previousPrice: BigNumber;
    previousDate: Date;
} | {
    bucket: ApiTimeBucket;
    price: BigNumber;
    shouldLoad: boolean;
    previousPrice: undefined;
    previousDate: undefined;
}> & {
    resultFunc: (res1: BigNumber, res2: import("../reducers/historical-types").TimeBucketsState<import("../apis/beefy/beefy-data-api-types").ApiChartData>, res3: boolean, res4: ApiTimeBucket) => {
        bucket: ApiTimeBucket;
        price: undefined;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: BigNumber;
        previousDate: Date;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    };
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, import("../reducers/historical-types").TimeBucketsState<import("../apis/beefy/beefy-data-api-types").ApiChartData>>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>, import("re-reselect").ParametricSelector<BeefyState, string, ApiTimeBucket>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, {
        bucket: ApiTimeBucket;
        price: undefined;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: BigNumber;
        previousDate: Date;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    }, (res1: BigNumber, res2: import("../reducers/historical-types").TimeBucketsState<import("../apis/beefy/beefy-data-api-types").ApiChartData>, res3: boolean, res4: ApiTimeBucket) => {
        bucket: ApiTimeBucket;
        price: undefined;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: BigNumber;
        previousDate: Date;
    } | {
        bucket: ApiTimeBucket;
        price: BigNumber;
        shouldLoad: boolean;
        previousPrice: undefined;
        previousDate: undefined;
    }, [import("re-reselect").ParametricSelector<BeefyState, string, BigNumber>, import("re-reselect").ParametricSelector<BeefyState, string, import("../reducers/historical-types").TimeBucketsState<import("../apis/beefy/beefy-data-api-types").ApiChartData>>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>, import("re-reselect").ParametricSelector<BeefyState, string, ApiTimeBucket>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectSupportedSwapTokensForChainAggregator: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", providerId: string) => TokenEntity[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[] | undefined, resultFuncArgs_1: {
        [address: string]: TokenEntity;
    } | undefined) => TokenEntity[];
    memoizedResultFunc: ((resultFuncArgs_0: string[] | undefined, resultFuncArgs_1: {
        [address: string]: TokenEntity;
    } | undefined) => TokenEntity[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TokenEntity[];
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"], providerId: string) => string[] | undefined, (state: BeefyState, chainId: ChainEntity["id"]) => {
        [address: string]: TokenEntity;
    } | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectSupportedSwapTokensForChainAggregatorHavingPrice: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", providerId: string) => TokenEntity[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TokenEntity[], resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => TokenEntity[];
    memoizedResultFunc: ((resultFuncArgs_0: TokenEntity[], resultFuncArgs_1: {
        [tokenId: string]: BigNumber;
    }) => TokenEntity[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TokenEntity[];
    dependencies: [((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", providerId: string) => TokenEntity[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: string[] | undefined, resultFuncArgs_1: {
            [address: string]: TokenEntity;
        } | undefined) => TokenEntity[];
        memoizedResultFunc: ((resultFuncArgs_0: string[] | undefined, resultFuncArgs_1: {
            [address: string]: TokenEntity;
        } | undefined) => TokenEntity[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => TokenEntity[];
        dependencies: [(state: BeefyState, chainId: ChainEntity["id"], providerId: string) => string[] | undefined, (state: BeefyState, chainId: ChainEntity["id"]) => {
            [address: string]: TokenEntity;
        } | undefined];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: BeefyState) => {
        [tokenId: string]: BigNumber;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVaultAssetTokensOrUndefined: import("re-reselect").ParametricSelector<BeefyState, string, TokenEntity[] | undefined> & {
    resultFunc: (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => TokenEntity[] | undefined;
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, TokenEntity[] | undefined, (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => TokenEntity[] | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultTokenSymbols: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => string[];
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectVaultIcons: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => string[];
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: ({
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
    }), res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, ({
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
    })>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectCurrentCowcentratedRangesByOracleId: (state: BeefyState, oracleId: TokenEntity["oracleId"]) => import("../entities/token").CurrentCowcentratedRangeData;
export declare const selectCurrentCowcentratedRangesByVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => import("../entities/token").CurrentCowcentratedRangeData;
export declare const selectCowcentratedLikeVaultDepositTokens: import("re-reselect").ParametricSelector<BeefyState, string, [TokenEntity, TokenEntity]> & {
    resultFunc: (res1: import("../entities/vault").VaultCowcentratedLike, res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => [TokenEntity, TokenEntity];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, import("../entities/vault").VaultCowcentratedLike>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, [TokenEntity, TokenEntity], (res1: import("../entities/vault").VaultCowcentratedLike, res2: {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }) => [TokenEntity, TokenEntity], [import("re-reselect").ParametricSelector<BeefyState, string, import("../entities/vault").VaultCowcentratedLike>, import("re-reselect").ParametricSelector<BeefyState, string, {
        ethereum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        polygon?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        bsc?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        optimism?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fantom?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        arbitrum?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        avax?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        cronos?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonbeam?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        moonriver?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        metis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fuse?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        kava?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        canto?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zksync?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        zkevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        base?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        gnosis?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        linea?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mantle?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        fraxtal?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        mode?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        manta?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        real?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sei?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        rootstock?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        scroll?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        lisk?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        sonic?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        aurora?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        emerald?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        berachain?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        celo?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        heco?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        harmony?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        saga?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        hyperevm?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        plasma?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        monad?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        megaeth?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
        robinhood?: {
            byId: {
                [id: string]: TokenEntity["address"];
            };
            byAddress: {
                [address: string]: TokenEntity;
            };
            native: import("../entities/token").TokenNative["id"] | undefined;
            wnative: import("../entities/token").TokenErc20["id"] | undefined;
            interestingBalanceTokenAddresses: TokenEntity["address"][];
            tokenIdsInActiveVaults: TokenEntity["id"][];
        } | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectCowcentratedLikeVaultDepositTokensWithPrices: import("re-reselect").ParametricSelector<BeefyState, string, ({
    price: BigNumber;
    id: string;
    symbol: string;
    providerId?: import("../entities/platform").PlatformEntity["id"];
    chainId: ChainEntity["id"];
    oracleId: string;
    address: string;
    decimals: number;
    buyUrl: string | undefined;
    type: "erc20";
    website: string | undefined;
    description: string | undefined;
    documentation: string | undefined;
    bridge?: string;
    tags: string[];
} | {
    price: BigNumber;
    id: string;
    symbol: string;
    providerId?: import("../entities/platform").PlatformEntity["id"];
    chainId: ChainEntity["id"];
    oracleId: string;
    address: string;
    decimals: number;
    buyUrl: string | undefined;
    type: "native";
    website: string | undefined;
    description: string | undefined;
    documentation: string | undefined;
    tags: string[];
})[]> & {
    resultFunc: (res1: [TokenEntity, TokenEntity], res2: {
        [tokenId: string]: BigNumber;
    }) => ({
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "erc20";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        bridge?: string;
        tags: string[];
    } | {
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "native";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        tags: string[];
    })[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, [TokenEntity, TokenEntity]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [tokenId: string]: BigNumber;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, ({
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "erc20";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        bridge?: string;
        tags: string[];
    } | {
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "native";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        tags: string[];
    })[], (res1: [TokenEntity, TokenEntity], res2: {
        [tokenId: string]: BigNumber;
    }) => ({
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "erc20";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        bridge?: string;
        tags: string[];
    } | {
        price: BigNumber;
        id: string;
        symbol: string;
        providerId?: import("../entities/platform").PlatformEntity["id"];
        chainId: ChainEntity["id"];
        oracleId: string;
        address: string;
        decimals: number;
        buyUrl: string | undefined;
        type: "native";
        website: string | undefined;
        description: string | undefined;
        documentation: string | undefined;
        tags: string[];
    })[], [import("re-reselect").ParametricSelector<BeefyState, string, [TokenEntity, TokenEntity]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [tokenId: string]: BigNumber;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectGovVaultEarnedTokens: ((state: BeefyState, _chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", vaultId: string) => TokenEntity[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../entities/vault").VaultGov, resultFuncArgs_1: {
        [address: string]: TokenEntity;
    } | undefined) => TokenEntity[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../entities/vault").VaultGov, resultFuncArgs_1: {
        [address: string]: TokenEntity;
    } | undefined) => TokenEntity[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TokenEntity[];
    dependencies: [(state: BeefyState, _chainId: ChainEntity["id"], vaultId: VaultEntity["id"]) => import("../entities/vault").VaultGov, (state: BeefyState, chainId: ChainEntity["id"], _vaultId: VaultEntity["id"]) => {
        [address: string]: TokenEntity;
    } | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
