import type { Hash } from 'viem';

export enum SubmitStatus {
  SUBMITTED = 'submitted',
  CLIENT_ERROR = 'client-error',
  SERVER_ERROR = 'server-error',
}

export type DivviSubmitRequest = {
  chainId: number;
  hash: Hash;
};

export type DivviSubmitResponse = {
  status: SubmitStatus;
};

export interface IDivviApi {
  markPending(chainId: number, hash: Hash): void;
  markReverted(hash: Hash): void;
  markConfirmed(hash: Hash): void;
}
