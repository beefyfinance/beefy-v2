import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
import { FormStep } from '../reducers/wallet/bridge-types';
import type { BeefyState } from '../store/types';
export declare const selectBridgeSupportedChainIds: (state: BeefyState) => ("ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood")[];
export declare const selectBridgeSupportedChainIdsFrom: (state: BeefyState, chainId: ChainEntity["id"]) => ("ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood")[];
export declare const selectBridgeIdsFromTo: (state: BeefyState, from: ChainEntity["id"], to: ChainEntity["id"]) => ("optimism" | "layer-zero" | "chainlink" | "axelar")[];
export declare const selectBridgeConfigById: (state: BeefyState, id: BeefyAnyBridgeConfig["id"]) => import("../apis/config-types").BeefyLayerZeroBridgeConfig | import("../apis/config-types").BeefyOptimismBridgeConfig | import("../apis/config-types").BeefyChainlinkBridgeConfig | import("../apis/config-types").BeefyAxelarBridgeConfig;
export declare const selectBridgeSourceToken: (state: BeefyState) => {
    id: string;
    symbol: string;
    chainId: ChainEntity["id"];
    oracleId: string;
    address: string;
    decimals: number;
};
export declare const selectBridgeSourceChainId: (state: BeefyState) => "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood";
export declare const selectBridgeDepositTokenForChainId: (state: BeefyState, chainId: ChainEntity["id"]) => import("../entities/token").TokenErc20;
export declare const selectBridgeXTokenForChainId: (state: BeefyState, chainId: ChainEntity["id"]) => import("../entities/token").TokenErc20;
export declare const selectBridgeFormStep: (state: BeefyState) => FormStep;
export declare const selectBridgeFormState: (state: BeefyState) => import("../reducers/wallet/bridge-types").BridgeFormState;
export declare const selectBridgeQuoteStatus: (state: BeefyState) => "idle" | "pending" | "fulfilled" | "rejected";
export declare const selectBridgeQuoteError: (state: BeefyState) => import("@reduxjs/toolkit").SerializedError | undefined;
export declare const selectBridgeQuoteErrorLimits: (state: BeefyState) => false | {
    current: BigNumber;
    max: BigNumber;
    canWait: boolean;
};
export declare const selectBridgeQuoteIds: (state: BeefyState) => ("optimism" | "layer-zero" | "chainlink" | "axelar")[];
export declare const selectBridgeQuoteById: (state: BeefyState, id: BeefyAnyBridgeConfig["id"]) => IBridgeQuote<BeefyAnyBridgeConfig>;
export declare const selectBridgeLimitedQuoteIds: (state: BeefyState) => ("optimism" | "layer-zero" | "chainlink" | "axelar")[];
export declare const selectBridgeLimitedQuoteById: (state: BeefyState, id: BeefyAnyBridgeConfig["id"]) => IBridgeQuote<BeefyAnyBridgeConfig>;
export declare const selectAllBridgeLimitedQuotes: ((state: BeefyState) => (IBridgeQuote<BeefyAnyBridgeConfig> | undefined)[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: ("optimism" | "layer-zero" | "chainlink" | "axelar")[], resultFuncArgs_1: Partial<Record<"optimism" | "layer-zero" | "chainlink" | "axelar", IBridgeQuote<BeefyAnyBridgeConfig>>>) => (IBridgeQuote<BeefyAnyBridgeConfig> | undefined)[];
    memoizedResultFunc: ((resultFuncArgs_0: ("optimism" | "layer-zero" | "chainlink" | "axelar")[], resultFuncArgs_1: Partial<Record<"optimism" | "layer-zero" | "chainlink" | "axelar", IBridgeQuote<BeefyAnyBridgeConfig>>>) => (IBridgeQuote<BeefyAnyBridgeConfig> | undefined)[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => (IBridgeQuote<BeefyAnyBridgeConfig> | undefined)[];
    dependencies: [(state: BeefyState) => ("optimism" | "layer-zero" | "chainlink" | "axelar")[], (state: BeefyState) => Partial<Record<"optimism" | "layer-zero" | "chainlink" | "axelar", IBridgeQuote<BeefyAnyBridgeConfig>>>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectBridgeQuoteSelectedId: (state: BeefyState) => "optimism" | "layer-zero" | "chainlink" | "axelar" | undefined;
export declare const selectBridgeHasSelectedQuote: (state: BeefyState) => boolean;
export declare const selectBridgeConfirmStatus: (state: BeefyState) => "idle" | "pending" | "fulfilled" | "rejected";
export declare const selectBridgeConfirmQuote: (state: BeefyState) => IBridgeQuote<BeefyAnyBridgeConfig>;
export declare function selectBridgeTxState(state: BeefyState): {
    step: string;
    status: string;
};
