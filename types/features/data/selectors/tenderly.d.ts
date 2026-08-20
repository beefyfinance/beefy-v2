import type { BeefyState } from '../store/types';
export declare const selectTenderlyMode: (state: BeefyState) => "result" | "request" | "simulate" | "calls" | "closed" | "login";
export declare const selectTenderlyStatus: (state: BeefyState) => "idle" | "pending" | "fulfilled" | "rejected";
export declare const selectTenderlyErrorOrUndefined: (state: BeefyState) => import("@reduxjs/toolkit").SerializedError | undefined;
export declare const selectTenderlyCredentialsOrUndefined: (state: BeefyState) => import("../actions/tenderly").TenderlyCredentials | undefined;
export declare const selectTenderlyRequestOrUndefined: (state: BeefyState) => {
    chainId: import("../entities/chain").ChainId;
    calls: import("../actions/tenderly").TenderlyTxCallRequest[];
} | undefined;
export declare const selectTenderlyResultOrUndefined: (state: BeefyState) => import("../actions/tenderly").TenderlySimulatePayload | undefined;
