import type { TFunction } from 'react-i18next';
import type { TenderlySimulateRequest, TenderlySimulateResponse } from '../apis/tenderly/types';
import type { TransactOption, TransactQuote } from '../apis/transact/transact-types';
import type { ChainId } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import type { Step } from '../reducers/wallet/stepper-types';
import type { BeefyDispatchFn } from '../store/types';
export type TenderlyTxCallRequest = {
    data: string;
    from: string;
    to: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    value?: string;
    step: string;
};
export type TenderlyCredentials = {
    account: string;
    project: string;
    secret: string;
};
export type TenderlyOpenSimulationPayload = {
    chainId: ChainId;
    calls: TenderlyTxCallRequest[];
};
export declare function captureTransactionsFromSteps(steps: Step[], dispatch: BeefyDispatchFn): Promise<{
    step: "bridge" | "approve" | "deposit" | "deposit-gov" | "withdraw" | "deposit-erc4626" | "request-withdraw" | "fulfill-request-withdraw" | "claim-withdraw" | "claim-gov" | "mint" | "burn" | "zap-in" | "zap-out" | "migration" | "claim-rewards" | "boost-stake" | "boost-unstake" | "boost-claim" | "boost-claim-unstake" | "redeem";
    data: string;
    from: string;
    to: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    value?: string;
}[]>;
type TenderlySaveConfigParams = {
    credentials: TenderlyCredentials;
};
type TenderlySaveConfigPayload = {
    credentials: TenderlyCredentials;
};
export declare const tenderlyLogin: import("@reduxjs/toolkit").AsyncThunk<TenderlySaveConfigPayload, TenderlySaveConfigParams, {
    state: import("../store/types").BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type TenderlySimulateTransactQuoteParams = {
    option: TransactOption;
    quote: TransactQuote;
    t: TFunction;
};
export declare const tenderlySimulateTransactQuote: import("@reduxjs/toolkit").AsyncThunk<TenderlyOpenSimulationPayload, TenderlySimulateTransactQuoteParams, {
    state: import("../store/types").BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type TenderlyStellaSwapClaimButtonParams = {
    chainId: ChainId;
    vaultId: VaultEntity['id'];
    t: TFunction;
};
export declare const tenderlySimulateStellaSwapClaim: import("@reduxjs/toolkit").AsyncThunk<TenderlyOpenSimulationPayload, TenderlyStellaSwapClaimButtonParams, {
    state: import("../store/types").BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type TenderlyMerklClaimButtonParams = {
    chainId: ChainId;
    t: TFunction;
};
export declare const tenderlySimulateMerklClaim: import("@reduxjs/toolkit").AsyncThunk<TenderlyOpenSimulationPayload, TenderlyMerklClaimButtonParams, {
    state: import("../store/types").BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type TenderlySimulateConfig = {
    type: 'full' | 'quick' | 'abi';
    save: 'always' | 'if-fails' | 'never';
};
export type TenderlySimulateParams = {
    config: TenderlySimulateConfig;
};
export type TenderlySimulatePayload = {
    chainId: ChainId;
    calls: TenderlyTxCallRequest[];
    config: TenderlySimulateConfig;
    requests: TenderlySimulateRequest[];
    responses: Array<TenderlySimulateResponse>;
};
export declare const tenderlySimulate: import("@reduxjs/toolkit").AsyncThunk<TenderlySimulatePayload, TenderlySimulateParams, {
    state: import("../store/types").BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
