import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig, BeefyBridgeConfig } from '../apis/config-types';
import { type BridgeFormState } from '../reducers/wallet/bridge-types';
import type { BeefyState } from '../store/types';
export type FetchBridgeConfigParams = void;
export type FetchBridgeChainPayload = {
    config: BeefyBridgeConfig;
};
export declare const fetchBridgeConfig: import("@reduxjs/toolkit").AsyncThunk<FetchBridgeChainPayload, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type InitBridgeFormParams = {
    walletAddress: string | undefined;
};
type InitBridgeFormPayload = {
    form: BridgeFormState;
};
export declare const initiateBridgeForm: import("@reduxjs/toolkit").AsyncThunk<InitBridgeFormPayload, InitBridgeFormParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const validateBridgeForm: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type QuoteBridgeFormPayload = {
    quotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
    limitedQuotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
};
export declare const quoteBridgeForm: import("@reduxjs/toolkit").AsyncThunk<QuoteBridgeFormPayload, void, {
    state: BeefyState;
    rejectValue: "AllQuotesRateLimitedError";
    rejectedMeta: {
        current: BigNumber;
        max: BigNumber;
        canWait: boolean;
    };
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
}>;
type ConfirmBridgeFormPayload = {
    quote: IBridgeQuote<BeefyAnyBridgeConfig>;
};
export declare const confirmBridgeForm: import("@reduxjs/toolkit").AsyncThunk<ConfirmBridgeFormPayload, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type PerformBridgeParams = {
    t: TFunction<Namespace>;
};
export declare const performBridge: import("@reduxjs/toolkit").AsyncThunk<void, PerformBridgeParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
