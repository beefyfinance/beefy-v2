type ResolveFulfilledPayload = {
    address: string;
    domain: string;
};
export type ResolveAddressToDomainArgs = {
    address?: string | null | undefined;
};
export declare const resolveAddressToDomain: import("@reduxjs/toolkit").AsyncThunk<ResolveFulfilledPayload, ResolveAddressToDomainArgs, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type ResolveDomainToAddressArgs = {
    domain?: string | null | undefined;
};
export declare const resolveDomainToAddress: import("@reduxjs/toolkit").AsyncThunk<ResolveFulfilledPayload, ResolveDomainToAddressArgs, {
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
