import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
export type AddToWalletParams = {
    chainId: ChainEntity['id'];
    tokenAddress: TokenEntity['address'];
    customIconUrl?: string;
};
export type AddTokenToWalletPayload = {
    token: TokenEntity;
    iconUrl: string;
};
export declare const addTokenToWalletAction: import("@reduxjs/toolkit").AsyncThunk<AddTokenToWalletPayload, AddToWalletParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
