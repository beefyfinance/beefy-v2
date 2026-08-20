import type { SerializedError } from '@reduxjs/toolkit';
export type IdleStatus = {
    status: 'idle';
};
export type PendingStatus = {
    status: 'pending';
};
export type RejectedStatus = {
    status: 'rejected';
    error: SerializedError;
};
export type FulfilledStatus = {
    status: 'fulfilled';
    value: string;
};
export type ResolverStatus = IdleStatus | PendingStatus | RejectedStatus | FulfilledStatus;
export type ResolverState = {
    byAddress: {
        [address: string]: ResolverStatus;
    };
    byDomain: {
        [address: string]: ResolverStatus;
    };
};
export declare function isIdleStatus(status: ResolverStatus): status is IdleStatus;
export declare function isPendingStatus(status: ResolverStatus): status is PendingStatus;
export declare function isRejectedStatus(status: ResolverStatus): status is RejectedStatus;
export declare function isFulfilledStatus(status: ResolverStatus): status is FulfilledStatus;
