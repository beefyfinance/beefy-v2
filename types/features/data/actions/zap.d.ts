import type { ZapAggregatorTokenSupportResponse } from '../apis/beefy/beefy-api-types';
import type { AmmConfig, SwapAggregatorConfig, ZapConfig, ZapFeeRule } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
interface FetchAllZapsFulfilledPayload {
    zaps: ZapConfig[];
}
export declare const fetchZapConfigsAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllZapsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface FetchZapFeeCampaignsFulfilledPayload {
    feeCampaigns: ZapFeeRule[];
}
export declare const fetchZapFeeCampaignsAction: import("@reduxjs/toolkit").AsyncThunk<FetchZapFeeCampaignsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface FetchAllSwapAggregatorsFulfilledPayload {
    aggregators: SwapAggregatorConfig[];
}
export declare const fetchZapSwapAggregatorsAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllSwapAggregatorsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type CalculateZapAvailabilityFulfilledPayload = {
    vaultIds: VaultEntity['id'][];
};
export declare const calculateZapAvailabilityAction: import("@reduxjs/toolkit").AsyncThunk<CalculateZapAvailabilityFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type FetchZapAggregatorTokenSupportFulfilledPayload = ZapAggregatorTokenSupportResponse;
export declare const fetchZapAggregatorTokenSupportAction: import("@reduxjs/toolkit").AsyncThunk<ZapAggregatorTokenSupportResponse, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface FetchZapAmmsFulfilledPayload {
    byChainId: {
        [chainId in ChainEntity['id']]?: AmmConfig[];
    };
}
export declare const fetchZapAmmsAction: import("@reduxjs/toolkit").AsyncThunk<FetchZapAmmsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
