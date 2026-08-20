import type BigNumber from 'bignumber.js';
import type { SerializedError } from '../apis/transact/strategies/error-types';
import type { InputTokenAmount, QuoteOutputTokenAmountChange, TransactOption, TransactQuote } from '../apis/transact/transact-types';
import type { ChainEntity } from '../entities/chain';
import { type VaultEntity } from '../entities/vault';
import { type DepositSource, TransactMode, type TransactStep } from '../reducers/wallet/transact-types';
import type { BeefyState } from '../store/types';
export type TransactInitArgs = {
    vaultId: VaultEntity['id'];
};
export type TransactInitReadyArgs = {
    vaultId: VaultEntity['id'];
    mode: TransactMode;
};
export declare const transactInit: import("@reduxjs/toolkit").ActionCreatorWithPayload<TransactInitArgs, string>;
export declare const transactInitReady: import("@reduxjs/toolkit").ActionCreatorWithPayload<TransactInitReadyArgs, string>;
export declare const transactSwitchMode: import("@reduxjs/toolkit").ActionCreatorWithPayload<TransactMode, string>;
export declare const transactSwitchStep: import("@reduxjs/toolkit").ActionCreatorWithPayload<TransactStep, string>;
export declare const transactSelectSelection: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    selectionId: string;
    resetInput: boolean;
}, string>;
export declare const transactSetInputAmount: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    index: number;
    amount: BigNumber;
    max: boolean;
}, string>;
export declare const transactClearInput: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"transact/clearInput">;
export declare const transactClearQuotes: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"transact/clearQuotes">;
export declare const transactInvalidateOptions: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"transact/invalidateOptions">;
export declare const transactConfirmPending: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    requestId: string;
}, string>;
export declare const transactConfirmRejected: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    requestId: string;
    error: SerializedError;
}, string>;
export declare const transactConfirmNeeded: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    requestId: string;
    changes: QuoteOutputTokenAmountChange[];
    newQuote: TransactQuote;
    originalQuoteId: TransactQuote["id"];
}, string>;
export declare const transactConfirmUnneeded: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    requestId: string;
    newQuote: TransactQuote;
    originalQuoteId: TransactQuote["id"];
}, string>;
export declare const transactSelectQuote: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    quoteId: string;
}, string>;
export declare const transactSetSelectedChainId: import("@reduxjs/toolkit").ActionCreatorWithPayload<"ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", string>;
export declare const transactSwitchDepositSource: import("@reduxjs/toolkit").ActionCreatorWithPayload<DepositSource, string>;
export declare const transactSetSlippage: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    slippage: number;
}, string>;
export declare const transactSetExecuting: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>;
export declare const transactSetSuccessClosed: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>;
export type TransactFetchOptionsArgs = {
    vaultId: VaultEntity['id'];
    mode: TransactMode;
    /** skip when the caller has already refreshed the user's balances (default: refresh) */
    refreshBalances?: boolean;
};
export type TransactFetchOptionsPayload = {
    options: TransactOption[];
    walletAddress: string | undefined;
};
export declare const transactFetchOptions: import("@reduxjs/toolkit").AsyncThunk<TransactFetchOptionsPayload, TransactFetchOptionsArgs, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type TransactFetchQuotesPayload = {
    selectionId: string;
    chainId: ChainEntity['id'];
    inputAmounts: InputTokenAmount[];
    quotes: TransactQuote[];
};
export declare const transactFetchQuotes: import("@reduxjs/toolkit").AsyncThunk<TransactFetchQuotesPayload, void, {
    state: BeefyState;
    rejectValue: SerializedError;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const transactFetchQuotesIfNeeded: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
