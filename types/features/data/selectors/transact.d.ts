import BigNumber from 'bignumber.js';
import type { PulseHighlightProps } from '../../vault/components/PulseHighlight/PulseHighlight';
import { type CrossChainChainOption, type TokenAmount, type TransactOption, type TransactQuote, type ZapFee } from '../apis/transact/transact-types';
import type { ChainEntity } from '../entities/chain';
import { type VaultEntity } from '../entities/vault';
import { DepositSource, TransactMode, TransactStatus, type PendingCrossChainOp, type TransactSelection } from '../reducers/wallet/transact-types';
import type { BeefyState } from '../store/types';
export declare const selectTransactStep: (state: BeefyState) => import("../reducers/wallet/transact-types").TransactStep;
export declare const selectTransactVaultId: (state: BeefyState) => string;
export declare const selectTransactVaultIdOrUndefined: (state: BeefyState) => string | undefined;
export declare const selectTransactPendingVaultIdOrUndefined: (state: BeefyState) => string | undefined;
export declare const selectTransactMode: (state: BeefyState) => TransactMode;
export declare const selectTransactSlippage: (state: BeefyState) => number;
export declare const selectTransactDepositSource: (state: BeefyState) => DepositSource;
export declare function selectVaultRefIdForSelection(state: BeefyState, selectionId: string): VaultEntity['id'] | undefined;
export declare const selectTransactDepositFromVaultId: (state: BeefyState) => VaultEntity["id"] | undefined;
export declare const selectTransactOptionsStatus: (state: BeefyState) => TransactStatus;
export declare const selectTransactOptionsError: (state: BeefyState) => import("../apis/transact/strategies/error-types").SerializedError | undefined;
export declare const selectTransactFormIsLoading: (state: BeefyState) => boolean;
export declare const selectTransactOptionsVaultId: (state: BeefyState) => string | undefined;
export declare const selectTransactOptionsMode: (state: BeefyState) => TransactMode;
export declare const selectTransactOptionsWalletAddress: (state: BeefyState) => string | undefined;
export declare const selectTransactInputAmounts: (state: BeefyState) => BigNumber[];
export declare const selectTransactInputMaxes: (state: BeefyState) => boolean[];
export declare const selectTransactInputIndexAmount: (state: BeefyState, index: number) => BigNumber;
export declare const selectTransactInputIndexMax: (state: BeefyState, index: number) => boolean;
export declare const selectTransactSelectedChainId: (state: BeefyState) => ("ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood") | undefined;
export declare const selectTransactSelectedSelectionId: (state: BeefyState) => string;
export declare const selectTransactSelectedQuoteId: (state: BeefyState) => string | undefined;
export declare const selectTransactQuoteError: (state: BeefyState) => import("../apis/transact/strategies/error-types").SerializedError | undefined;
export declare const selectTransactSelectedQuote: (state: BeefyState) => import("../apis/transact/transact-types").StandardVaultDepositQuote | import("../apis/transact/transact-types").GovVaultDepositQuote | import("../apis/transact/transact-types").CowcentratedVaultDepositQuote | import("../apis/transact/transact-types").Erc4626VaultDepositQuote | import("../apis/transact/transact-types").SingleDepositQuote | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").CurveDepositQuote | import("../apis/transact/transact-types").GammaDepositQuote | import("../apis/transact/transact-types").ConicDepositQuote | import("../apis/transact/transact-types").CowcentratedZapDepositQuote | import("../apis/transact/transact-types").CowcentratedDualZapDepositQuote | import("../apis/transact/transact-types").GovComposerZapDepositQuote | import("../apis/transact/transact-types").VaultComposerZapDepositQuote | import("../apis/transact/transact-types").RewardPoolToVaultDepositQuote | import("../apis/transact/transact-types").BalancerDepositQuote | import("../apis/transact/transact-types").PendleV2DepositQuote | import("../apis/transact/transact-types").CrossChainDepositQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenDepositQuote | import("../apis/transact/transact-types").StandardVaultWithdrawQuote | import("../apis/transact/transact-types").GovVaultWithdrawQuote | import("../apis/transact/transact-types").CowcentratedVaultWithdrawQuote | import("../apis/transact/transact-types").Erc4626VaultWithdrawQuote | import("../apis/transact/transact-types").SingleWithdrawQuote | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").UniswapV2WithdrawOption> | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").SolidlyWithdrawOption> | import("../apis/transact/transact-types").CurveWithdrawQuote | import("../apis/transact/transact-types").GammaBreakWithdrawQuote | import("../apis/transact/transact-types").ConicWithdrawQuote | import("../apis/transact/transact-types").CowcentratedZapWithdrawQuote | import("../apis/transact/transact-types").GovComposerZapWithdrawQuote | import("../apis/transact/transact-types").VaultComposerZapWithdrawQuote | import("../apis/transact/transact-types").BalancerWithdrawQuoteSingle | import("../apis/transact/transact-types").BalancerWithdrawQuoteAll | import("../apis/transact/transact-types").PendleV2WithdrawQuote | import("../apis/transact/transact-types").CrossChainWithdrawQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenWithdrawQuote;
export declare const selectTransactSelectedQuoteOrUndefined: ((state: BeefyState) => import("../apis/transact/transact-types").StandardVaultDepositQuote | import("../apis/transact/transact-types").GovVaultDepositQuote | import("../apis/transact/transact-types").CowcentratedVaultDepositQuote | import("../apis/transact/transact-types").Erc4626VaultDepositQuote | import("../apis/transact/transact-types").SingleDepositQuote | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").CurveDepositQuote | import("../apis/transact/transact-types").GammaDepositQuote | import("../apis/transact/transact-types").ConicDepositQuote | import("../apis/transact/transact-types").CowcentratedZapDepositQuote | import("../apis/transact/transact-types").CowcentratedDualZapDepositQuote | import("../apis/transact/transact-types").GovComposerZapDepositQuote | import("../apis/transact/transact-types").VaultComposerZapDepositQuote | import("../apis/transact/transact-types").RewardPoolToVaultDepositQuote | import("../apis/transact/transact-types").BalancerDepositQuote | import("../apis/transact/transact-types").PendleV2DepositQuote | import("../apis/transact/transact-types").CrossChainDepositQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenDepositQuote | import("../apis/transact/transact-types").StandardVaultWithdrawQuote | import("../apis/transact/transact-types").GovVaultWithdrawQuote | import("../apis/transact/transact-types").CowcentratedVaultWithdrawQuote | import("../apis/transact/transact-types").Erc4626VaultWithdrawQuote | import("../apis/transact/transact-types").SingleWithdrawQuote | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").UniswapV2WithdrawOption> | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").SolidlyWithdrawOption> | import("../apis/transact/transact-types").CurveWithdrawQuote | import("../apis/transact/transact-types").GammaBreakWithdrawQuote | import("../apis/transact/transact-types").ConicWithdrawQuote | import("../apis/transact/transact-types").CowcentratedZapWithdrawQuote | import("../apis/transact/transact-types").GovComposerZapWithdrawQuote | import("../apis/transact/transact-types").VaultComposerZapWithdrawQuote | import("../apis/transact/transact-types").BalancerWithdrawQuoteSingle | import("../apis/transact/transact-types").BalancerWithdrawQuoteAll | import("../apis/transact/transact-types").PendleV2WithdrawQuote | import("../apis/transact/transact-types").CrossChainWithdrawQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenWithdrawQuote | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string | undefined, resultFuncArgs_1: Record<string, TransactQuote>) => import("../apis/transact/transact-types").StandardVaultDepositQuote | import("../apis/transact/transact-types").GovVaultDepositQuote | import("../apis/transact/transact-types").CowcentratedVaultDepositQuote | import("../apis/transact/transact-types").Erc4626VaultDepositQuote | import("../apis/transact/transact-types").SingleDepositQuote | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").CurveDepositQuote | import("../apis/transact/transact-types").GammaDepositQuote | import("../apis/transact/transact-types").ConicDepositQuote | import("../apis/transact/transact-types").CowcentratedZapDepositQuote | import("../apis/transact/transact-types").CowcentratedDualZapDepositQuote | import("../apis/transact/transact-types").GovComposerZapDepositQuote | import("../apis/transact/transact-types").VaultComposerZapDepositQuote | import("../apis/transact/transact-types").RewardPoolToVaultDepositQuote | import("../apis/transact/transact-types").BalancerDepositQuote | import("../apis/transact/transact-types").PendleV2DepositQuote | import("../apis/transact/transact-types").CrossChainDepositQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenDepositQuote | import("../apis/transact/transact-types").StandardVaultWithdrawQuote | import("../apis/transact/transact-types").GovVaultWithdrawQuote | import("../apis/transact/transact-types").CowcentratedVaultWithdrawQuote | import("../apis/transact/transact-types").Erc4626VaultWithdrawQuote | import("../apis/transact/transact-types").SingleWithdrawQuote | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").UniswapV2WithdrawOption> | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").SolidlyWithdrawOption> | import("../apis/transact/transact-types").CurveWithdrawQuote | import("../apis/transact/transact-types").GammaBreakWithdrawQuote | import("../apis/transact/transact-types").ConicWithdrawQuote | import("../apis/transact/transact-types").CowcentratedZapWithdrawQuote | import("../apis/transact/transact-types").GovComposerZapWithdrawQuote | import("../apis/transact/transact-types").VaultComposerZapWithdrawQuote | import("../apis/transact/transact-types").BalancerWithdrawQuoteSingle | import("../apis/transact/transact-types").BalancerWithdrawQuoteAll | import("../apis/transact/transact-types").PendleV2WithdrawQuote | import("../apis/transact/transact-types").CrossChainWithdrawQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenWithdrawQuote | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: string | undefined, resultFuncArgs_1: Record<string, TransactQuote>) => import("../apis/transact/transact-types").StandardVaultDepositQuote | import("../apis/transact/transact-types").GovVaultDepositQuote | import("../apis/transact/transact-types").CowcentratedVaultDepositQuote | import("../apis/transact/transact-types").Erc4626VaultDepositQuote | import("../apis/transact/transact-types").SingleDepositQuote | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").CurveDepositQuote | import("../apis/transact/transact-types").GammaDepositQuote | import("../apis/transact/transact-types").ConicDepositQuote | import("../apis/transact/transact-types").CowcentratedZapDepositQuote | import("../apis/transact/transact-types").CowcentratedDualZapDepositQuote | import("../apis/transact/transact-types").GovComposerZapDepositQuote | import("../apis/transact/transact-types").VaultComposerZapDepositQuote | import("../apis/transact/transact-types").RewardPoolToVaultDepositQuote | import("../apis/transact/transact-types").BalancerDepositQuote | import("../apis/transact/transact-types").PendleV2DepositQuote | import("../apis/transact/transact-types").CrossChainDepositQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenDepositQuote | import("../apis/transact/transact-types").StandardVaultWithdrawQuote | import("../apis/transact/transact-types").GovVaultWithdrawQuote | import("../apis/transact/transact-types").CowcentratedVaultWithdrawQuote | import("../apis/transact/transact-types").Erc4626VaultWithdrawQuote | import("../apis/transact/transact-types").SingleWithdrawQuote | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").UniswapV2WithdrawOption> | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").SolidlyWithdrawOption> | import("../apis/transact/transact-types").CurveWithdrawQuote | import("../apis/transact/transact-types").GammaBreakWithdrawQuote | import("../apis/transact/transact-types").ConicWithdrawQuote | import("../apis/transact/transact-types").CowcentratedZapWithdrawQuote | import("../apis/transact/transact-types").GovComposerZapWithdrawQuote | import("../apis/transact/transact-types").VaultComposerZapWithdrawQuote | import("../apis/transact/transact-types").BalancerWithdrawQuoteSingle | import("../apis/transact/transact-types").BalancerWithdrawQuoteAll | import("../apis/transact/transact-types").PendleV2WithdrawQuote | import("../apis/transact/transact-types").CrossChainWithdrawQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenWithdrawQuote | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/transact/transact-types").StandardVaultDepositQuote | import("../apis/transact/transact-types").GovVaultDepositQuote | import("../apis/transact/transact-types").CowcentratedVaultDepositQuote | import("../apis/transact/transact-types").Erc4626VaultDepositQuote | import("../apis/transact/transact-types").SingleDepositQuote | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").UniswapV2DepositOption> | import("../apis/transact/transact-types").UniswapLikePoolDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").UniswapLikeAggregatorDepositQuote<import("../apis/transact/transact-types").SolidlyDepositOption> | import("../apis/transact/transact-types").CurveDepositQuote | import("../apis/transact/transact-types").GammaDepositQuote | import("../apis/transact/transact-types").ConicDepositQuote | import("../apis/transact/transact-types").CowcentratedZapDepositQuote | import("../apis/transact/transact-types").CowcentratedDualZapDepositQuote | import("../apis/transact/transact-types").GovComposerZapDepositQuote | import("../apis/transact/transact-types").VaultComposerZapDepositQuote | import("../apis/transact/transact-types").RewardPoolToVaultDepositQuote | import("../apis/transact/transact-types").BalancerDepositQuote | import("../apis/transact/transact-types").PendleV2DepositQuote | import("../apis/transact/transact-types").CrossChainDepositQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenDepositQuote | import("../apis/transact/transact-types").StandardVaultWithdrawQuote | import("../apis/transact/transact-types").GovVaultWithdrawQuote | import("../apis/transact/transact-types").CowcentratedVaultWithdrawQuote | import("../apis/transact/transact-types").Erc4626VaultWithdrawQuote | import("../apis/transact/transact-types").SingleWithdrawQuote | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").UniswapV2WithdrawOption> | import("../apis/transact/transact-types").UniswapLikeBreakWithdrawQuote<import("../apis/transact/transact-types").SolidlyWithdrawOption> | import("../apis/transact/transact-types").CurveWithdrawQuote | import("../apis/transact/transact-types").GammaBreakWithdrawQuote | import("../apis/transact/transact-types").ConicWithdrawQuote | import("../apis/transact/transact-types").CowcentratedZapWithdrawQuote | import("../apis/transact/transact-types").GovComposerZapWithdrawQuote | import("../apis/transact/transact-types").VaultComposerZapWithdrawQuote | import("../apis/transact/transact-types").BalancerWithdrawQuoteSingle | import("../apis/transact/transact-types").BalancerWithdrawQuoteAll | import("../apis/transact/transact-types").PendleV2WithdrawQuote | import("../apis/transact/transact-types").CrossChainWithdrawQuote | import("../apis/transact/transact-types").VaultToVaultSingleTokenWithdrawQuote | undefined;
    dependencies: [(state: BeefyState) => string | undefined, (state: BeefyState) => Record<string, TransactQuote>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactQuoteById: ((state: BeefyState, quoteId: string) => TransactQuote) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactQuote>) => TransactQuote;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactQuote>) => TransactQuote) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactQuote;
    dependencies: [(_state: BeefyState, quoteId: TransactQuote["id"]) => string, (state: BeefyState) => Record<string, TransactQuote>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactQuoteStatus: (state: BeefyState) => TransactStatus;
export declare const selectTransactQuoteIds: (state: BeefyState) => string[];
export declare const selectTransactQuotes: ((state: BeefyState) => TransactQuote[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: Record<string, TransactQuote>) => TransactQuote[];
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: Record<string, TransactQuote>) => TransactQuote[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactQuote[];
    dependencies: [(state: BeefyState) => string[], (state: BeefyState) => Record<string, TransactQuote>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactSelectionById: ((state: BeefyState, selectionId: string) => TransactSelection) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactSelection>) => TransactSelection;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactSelection>) => TransactSelection) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactSelection;
    dependencies: [(_state: BeefyState, selectionId: TransactOption["selectionId"]) => string, (state: BeefyState) => Record<string, TransactSelection>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactSelected: ((state: BeefyState) => TransactSelection) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactSelection>) => TransactSelection;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactSelection>) => TransactSelection) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactSelection;
    dependencies: [(state: BeefyState) => string, (state: BeefyState) => Record<string, TransactSelection>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
/** True when the active selection's withdraw is sourced from the page vault (option declares its shareToken as input). */
export declare const selectTransactIsActiveSelectionVaultSourceWithdraw: (state: BeefyState) => boolean;
export declare const selectTransactDepositInputAmountExceedsBalance: (state: BeefyState) => boolean;
export declare const selectTransactWithdrawInputAmountExceedsBalance: (state: BeefyState) => boolean;
export declare const selectTransactTokenChains: (state: BeefyState) => ("ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood")[];
export declare const selectTransactNumTokens: (state: BeefyState) => number;
export declare const selectTransactWithdrawSelectionsForChain: (state: BeefyState, chainId: ChainEntity["id"]) => TransactSelection[];
export declare const selectTransactWithdrawSelectionsForChainWithBalances: (state: BeefyState, chainId: ChainEntity["id"], vaultId: VaultEntity["id"], walletAddress?: string) => SelectionRow[];
export type SelectionRow = TransactSelection & {
    balanceValue: BigNumber;
    balance: BigNumber | undefined;
    decimals: number;
    tag: string | undefined;
    vaultRefId?: VaultEntity['id'];
};
export declare const selectTransactDepositTokensForChainIdWithBalances: (state: BeefyState, chainId: ChainEntity["id"], vaultId: VaultEntity["id"]) => SelectionRow[];
export type DepositFromVaultEntry = TransactSelection & {
    balance: BigNumber;
    balanceUsd: BigNumber;
    decimals: number;
    vaultId: VaultEntity['id'];
};
export declare const selectTransactDepositFromVaultEntries: (state: BeefyState) => DepositFromVaultEntry[];
export declare const selectTransactUserHasOtherDepositedVaults: ((state: BeefyState) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: DepositFromVaultEntry[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: DepositFromVaultEntry[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState) => DepositFromVaultEntry[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactIsDepositFromVault: (state: BeefyState) => boolean;
export declare const selectTransactOptionById: ((state: BeefyState, optionId: string) => TransactOption) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactOption>) => TransactOption;
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: Record<string, TransactOption>) => TransactOption) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactOption;
    dependencies: [(_state: BeefyState, optionId: string) => string, (state: BeefyState) => Record<string, TransactOption>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactOptionIdsForSelectionId: ((state: BeefyState, selectionId: string) => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: Record<string, string[]>) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: Record<string, string[]>) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(_state: BeefyState, selectionId: string) => string, (state: BeefyState) => Record<string, string[]>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactOptionsForSelectionId: ((state: BeefyState, selectionId: string) => TransactOption[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: Record<string, TransactOption>) => TransactOption[];
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: Record<string, TransactOption>) => TransactOption[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => TransactOption[];
    dependencies: [(state: BeefyState, selectionId: string) => string[], (state: BeefyState) => Record<string, TransactOption>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactSelectedZapFee: ((state: BeefyState) => {
    option: TransactOption;
    fee: ZapFee;
} | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: BeefyState) => {
        option: TransactOption;
        fee: ZapFee;
    } | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: BeefyState) => {
        option: TransactOption;
        fee: ZapFee;
    } | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        option: TransactOption;
        fee: ZapFee;
    } | undefined;
    dependencies: [(state: BeefyState) => BeefyState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare function selectTokenAmountsTotalValue(state: BeefyState, tokenAmounts: TokenAmount[]): BigNumber;
export declare function selectTokenAmountValue(state: BeefyState, tokenAmount: TokenAmount): BigNumber;
export declare const selectTransactExecuting: (state: BeefyState) => boolean;
export declare const selectTransactConfirmStatus: (state: BeefyState) => TransactStatus;
export declare const selectTransactConfirmError: (state: BeefyState) => import("../apis/transact/strategies/error-types").SerializedError | undefined;
export declare const selectTransactConfirmChanges: (state: BeefyState) => import("../apis/transact/transact-types").QuoteOutputTokenAmountChange[];
/** True when "quote has changed, please confirm" is shown — button should be enabled so user can confirm with new quote */
export declare const selectTransactConfirmNeededWithChanges: ((state: BeefyState) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: TransactStatus, resultFuncArgs_1: import("../apis/transact/transact-types").QuoteOutputTokenAmountChange[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: TransactStatus, resultFuncArgs_1: import("../apis/transact/transact-types").QuoteOutputTokenAmountChange[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState) => TransactStatus, (state: BeefyState) => import("../apis/transact/transact-types").QuoteOutputTokenAmountChange[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactForceSelection: (state: BeefyState) => boolean;
export declare const selectTransactVaultHasCrossChainZap: (state: BeefyState) => boolean;
export declare function selectTransactCrossChainPreflight(state: BeefyState): boolean;
/**
 * Returns the list of chains available for cross-chain deposit, sorted as:
 * 1. Chains with balance before chains without
 * 2. Among chains with balance, sorted by USD balance descending
 * 3. Among chains with $0 balance, sorted alphabetically by chain name
 */
export declare const selectCrossChainSortedChains: (state: BeefyState, vaultId: VaultEntity["id"]) => CrossChainChainOption[];
export declare const selectTransactShouldShowClaims: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: ({
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
    }), resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean, resultFuncArgs_5: boolean, resultFuncArgs_6: boolean) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: ({
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
    }), resultFuncArgs_1: boolean, resultFuncArgs_2: boolean, resultFuncArgs_3: boolean, resultFuncArgs_4: boolean, resultFuncArgs_5: boolean, resultFuncArgs_6: boolean) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => ({
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
    }), ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: {
            index: number;
            token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: {
            index: number;
            token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => {
            index: number;
            token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
            price: BigNumber;
            apr: number;
        }[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
                [tokenId: string]: BigNumber;
            }) => {
                index: number;
                token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
                price: BigNumber;
                apr: number;
            }[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: import("../apis/contract-data/contract-data-types").RewardContractData[], resultFuncArgs_1: BigNumber, resultFuncArgs_2: {
                [tokenId: string]: BigNumber;
            }) => {
                index: number;
                token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
                price: BigNumber;
                apr: number;
            }[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => {
                index: number;
                token: Pick<import("../entities/token").TokenEntity, "symbol" | "chainId" | "address" | "oracleId" | "decimals">;
                price: BigNumber;
                apr: number;
            }[] | undefined;
            dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../apis/contract-data/contract-data-types").RewardContractData[], (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber, (state: BeefyState) => {
                [tokenId: string]: BigNumber;
            }];
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
    }, (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => boolean, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("./rewards").MerklRewardsCampaignWithApr[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("./rewards").MerklRewardsCampaignWithApr[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("./rewards").MerklRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>) => import("./rewards").MerklRewardsCampaignWithApr[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>) => import("./rewards").MerklRewardsCampaignWithApr[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("./rewards").MerklRewardsCampaignWithApr[] | undefined;
            dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>];
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
    }, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined;
            dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, (state: BeefyState) => string | undefined];
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
    }, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>) => import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/rewards-types").VaultRewardApr[], resultFuncArgs_1: Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>) => import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("./rewards").StellaSwapRewardsCampaignWithApr[] | undefined;
            dependencies: [(state: BeefyState, vaultId: VaultEntity["id"]) => import("../reducers/rewards-types").VaultRewardApr[], (state: BeefyState) => Record<string, import("../reducers/rewards-types").MerklRewardsCampaign | import("../reducers/rewards-types").StellaSwapRewardsCampaign>];
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
    }, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
            dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, (state: BeefyState) => string | undefined];
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
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactShouldShowClaimsNotification: ((state: BeefyState, vaultId: string, walletAddress?: string | undefined) => false | "success" | "error" | "loading" | "warning" | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean) => false | "success" | "error" | "loading" | "warning" | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: boolean, resultFuncArgs_2: boolean) => false | "success" | "error" | "loading" | "warning" | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => false | "success" | "error" | "loading" | "warning" | undefined;
    dependencies: [(state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => boolean, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("../reducers/wallet/user-rewards-types").MerklVaultReward[] | undefined;
            dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, (state: BeefyState) => string | undefined];
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
    }, ((state: BeefyState, vaultId: string) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean;
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) => boolean) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => boolean;
        dependencies: [((state: BeefyState, vaultId: string) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
            memoizedResultFunc: ((resultFuncArgs_0: string, resultFuncArgs_1: {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, resultFuncArgs_2: string | undefined) => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("../reducers/wallet/user-rewards-types").StellaSwapVaultReward[] | undefined;
            dependencies: [(_state: BeefyState, vaultId: VaultEntity["id"]) => string, (state: BeefyState) => {
                [userAddress: string]: {
                    byProvider: {
                        merkl: import("../reducers/wallet/user-rewards-types").MerklRewardsState;
                        stellaswap: import("../reducers/wallet/user-rewards-types").StellaSwapRewardsState;
                    };
                };
            }, (state: BeefyState) => string | undefined];
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
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectTransactShouldShowBoost: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectTransactShouldShowBoostNotification: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => PulseHighlightProps["variant"] | false;
export declare const selectTransactShouldShowWithdrawNotification: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => PulseHighlightProps["variant"] | false;
export declare const selectCrossChainPendingOps: ((state: BeefyState) => PendingCrossChainOp[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => PendingCrossChainOp[];
    dependencies: [(state: BeefyState) => import("../reducers/wallet/transact-types").TransactCrossChain];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectCrossChainPendingOpById: (state: BeefyState, opId: string) => PendingCrossChainOp;
export declare const selectCrossChainRecoverableOps: ((state: BeefyState) => PendingCrossChainOp[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[];
    memoizedResultFunc: ((resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => PendingCrossChainOp[];
    dependencies: [((state: BeefyState) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[];
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => PendingCrossChainOp[];
        dependencies: [(state: BeefyState) => import("../reducers/wallet/transact-types").TransactCrossChain];
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
/** Dest-failed op for the current transact vault, if any (most recent by updatedAt). Used to show recovery UI after modal close. */
export declare const selectRecoveryOpForCurrentVault: ((state: BeefyState) => PendingCrossChainOp | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string | undefined, resultFuncArgs_1: PendingCrossChainOp[]) => PendingCrossChainOp | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: string | undefined, resultFuncArgs_1: PendingCrossChainOp[]) => PendingCrossChainOp | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => PendingCrossChainOp | undefined;
    dependencies: [(state: BeefyState) => string | undefined, ((state: BeefyState) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[];
        memoizedResultFunc: ((resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => PendingCrossChainOp[];
        dependencies: [((state: BeefyState) => PendingCrossChainOp[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[];
            memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[]) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => PendingCrossChainOp[];
            dependencies: [(state: BeefyState) => import("../reducers/wallet/transact-types").TransactCrossChain];
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
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectCrossChainActiveOps: ((state: BeefyState) => PendingCrossChainOp[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[];
    memoizedResultFunc: ((resultFuncArgs_0: PendingCrossChainOp[]) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => PendingCrossChainOp[];
    dependencies: [((state: BeefyState) => PendingCrossChainOp[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[];
        memoizedResultFunc: ((resultFuncArgs_0: import("../reducers/wallet/transact-types").TransactCrossChain) => PendingCrossChainOp[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => PendingCrossChainOp[];
        dependencies: [(state: BeefyState) => import("../reducers/wallet/transact-types").TransactCrossChain];
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
export declare const selectCrossChainRecoveryQuoteStatus: (state: BeefyState) => TransactStatus;
export declare const selectCrossChainRecoveryQuote: (state: BeefyState) => import("../apis/transact/transact-types").RecoveryQuote | undefined;
export declare const selectCrossChainRecoveryQuoteOpId: (state: BeefyState) => string | undefined;
export declare const selectCrossChainRecoveryQuoteError: (state: BeefyState) => import("../apis/transact/strategies/error-types").SerializedError | undefined;
export declare const selectCrossChainRecoveryQuoteIsStale: (state: BeefyState) => boolean;
export declare const selectTransactSuccessClosed: (state: BeefyState) => boolean;
export declare const selectTransactShouldShowMigrate: (state: BeefyState, vaultId: VaultEntity["id"] | undefined) => boolean;
