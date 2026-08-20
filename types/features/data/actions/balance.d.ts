import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export interface FetchAllBalanceActionParams {
    chainId: ChainEntity['id'];
    walletAddress: string;
}
export interface FetchAllBalanceFulfilledPayload {
    chainId: ChainEntity['id'];
    walletAddress: string;
    data: FetchAllBalancesResult;
    state: BeefyState;
}
export declare const fetchAllBalanceAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllBalanceFulfilledPayload, FetchAllBalanceActionParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type FetchBalanceParams = {
    chainId: ChainEntity['id'];
    tokens?: TokenEntity[];
    vaults?: VaultEntity[];
};
export declare const fetchBalanceAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllBalanceFulfilledPayload, FetchBalanceParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type RecalculateDepositedVaultsParams = {
    walletAddress: string;
    fromTimelineListener?: boolean;
};
export type RecalculateDepositedVaultsPayload = {
    walletAddress: string;
    vaultIds: VaultEntity['id'][];
    addedVaultIds: VaultEntity['id'][];
};
export declare const recalculateDepositedVaultsAction: import("@reduxjs/toolkit").AsyncThunk<RecalculateDepositedVaultsPayload, RecalculateDepositedVaultsParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
