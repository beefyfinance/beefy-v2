import type { TFunction } from 'react-i18next';
import { type ZapQuoteStep } from '../apis/transact/transact-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import type { VaultEntity } from '../entities/vault';
import type { AmmEntity, SwapAggregatorEntity } from '../entities/zap';
import type { BeefyState } from '../store/types';
export declare const selectZapByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => import("../apis/config-types").ZapConfig | undefined;
export declare const selectZapFeeConfigByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => {
    recipient: string;
    bps: number;
} | undefined;
export declare const selectZapFeeRules: (state: BeefyState) => import("../apis/config-types").ZapFeeRule[];
export declare const selectValidZapFeeRules: ((state: BeefyState) => import("../apis/config-types").ZapFeeRule[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/config-types").ZapFeeRule[];
    dependencies: [(state: BeefyState) => import("../apis/config-types").ZapFeeRule[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectFeaturedZapFeeRules: ((state: BeefyState) => import("../apis/config-types").ZapFeeRule[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/config-types").ZapFeeRule[];
    dependencies: [((state: BeefyState) => import("../apis/config-types").ZapFeeRule[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[];
        memoizedResultFunc: ((resultFuncArgs_0: import("../apis/config-types").ZapFeeRule[]) => import("../apis/config-types").ZapFeeRule[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../apis/config-types").ZapFeeRule[];
        dependencies: [(state: BeefyState) => import("../apis/config-types").ZapFeeRule[]];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export type ZapVaultCampaign = {
    effectiveBps: number;
    baseBps: number;
    free: boolean;
    description?: string;
    id?: string;
};
export declare const selectZapCampaignByVaultId: import("re-reselect").ParametricSelector<BeefyState, string, ZapVaultCampaign | undefined> & {
    resultFunc: (res1: import("../apis/config-types").ZapFeeRule[], res2: VaultEntity | undefined, res3: import("../apis/config-types").ZapConfig | undefined, res4: number) => ZapVaultCampaign | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/config-types").ZapFeeRule[]>, import("re-reselect").ParametricSelector<BeefyState, string, VaultEntity | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/config-types").ZapConfig | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, number>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, ZapVaultCampaign | undefined, (res1: import("../apis/config-types").ZapFeeRule[], res2: VaultEntity | undefined, res3: import("../apis/config-types").ZapConfig | undefined, res4: number) => ZapVaultCampaign | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/config-types").ZapFeeRule[]>, import("re-reselect").ParametricSelector<BeefyState, string, VaultEntity | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/config-types").ZapConfig | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, number>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectSwapAggregatorById: (state: BeefyState, id: SwapAggregatorEntity["id"]) => import("../apis/config-types").SwapAggregatorConfig;
export declare const selectSwapAggregatorsExistForChain: (state: BeefyState, chainId: ChainEntity["id"]) => boolean;
export declare const selectSwapAggregatorsForChain: ((state: BeefyState, chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") => import("../apis/config-types").SwapAggregatorConfig[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        kyber?: string | undefined;
        "one-inch"?: string | undefined;
        "liquid-swap"?: string | undefined;
    } | undefined, resultFuncArgs_1: {
        [aggregatorId: string]: import("../apis/config-types").SwapAggregatorConfig;
    }) => import("../apis/config-types").SwapAggregatorConfig[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        kyber?: string | undefined;
        "one-inch"?: string | undefined;
        "liquid-swap"?: string | undefined;
    } | undefined, resultFuncArgs_1: {
        [aggregatorId: string]: import("../apis/config-types").SwapAggregatorConfig;
    }) => import("../apis/config-types").SwapAggregatorConfig[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/config-types").SwapAggregatorConfig[];
    dependencies: [(state: BeefyState, chainId: ChainEntity["id"]) => {
        kyber?: string | undefined;
        "one-inch"?: string | undefined;
        "liquid-swap"?: string | undefined;
    } | undefined, (state: BeefyState) => {
        [aggregatorId: string]: import("../apis/config-types").SwapAggregatorConfig;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectSwapAggregatorForChainType: <T extends SwapAggregatorEntity["type"]>(state: BeefyState, chainId: ChainEntity["id"], type: T) => Extract<SwapAggregatorEntity, {
    type: T;
}>;
export declare const selectZapTokenScoresByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => Record<TokenEntity["id"], number>;
export declare const selectZapTokenScore: (state: BeefyState, chainId: ChainEntity["id"], tokenId: TokenEntity["id"]) => number;
export declare const selectVaultSupportsZap: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectAmmsByChainId: (state: BeefyState, chainId: ChainEntity["id"]) => AmmEntity[];
export declare const selectAmmById: ((state: BeefyState, ammId: string) => AmmEntity) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
        [ammId: string]: AmmEntity;
    }) => AmmEntity;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
        [ammId: string]: AmmEntity;
    }) => AmmEntity) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => AmmEntity;
    dependencies: [(_state: BeefyState, ammId: AmmEntity["id"]) => string, (state: BeefyState, _ammId: AmmEntity["id"]) => {
        [ammId: string]: AmmEntity;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectZapSwapProviderName: (state: BeefyState, providerId: string, type: "pool" | "aggregator", t: TFunction) => string;
export declare const selectZapQuoteTitle: (state: BeefyState, steps: ZapQuoteStep[], t: TFunction) => {
    title: string;
    icon: string;
};
export type ZapQuoteProvider = {
    name: string;
    icon: string;
};
export declare const selectZapQuoteProviders: (state: BeefyState, steps: ZapQuoteStep[], t: TFunction) => ZapQuoteProvider[];
