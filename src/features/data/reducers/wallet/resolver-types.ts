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

export function isIdleStatus(status: ResolverStatus): status is IdleStatus {
  return status.status === 'idle';
}

export function isPendingStatus(status: ResolverStatus): status is PendingStatus {
  return status.status === 'pending';
}

export function isRejectedStatus(status: ResolverStatus): status is RejectedStatus {
  return status.status === 'rejected';
}

export function isFulfilledStatus(status: ResolverStatus): status is FulfilledStatus {
  return status.status === 'fulfilled';
}
