import type {
  TenderlyCredentials,
  TenderlySimulatePayload,
  TenderlyTxCallRequest,
} from '../actions/tenderly.ts';
import type { SerializedError } from '@reduxjs/toolkit';
import type { ChainId } from '../apis/chains/entity-types.ts';

type SimulateRequest = {
  chainId: ChainId;
  calls: TenderlyTxCallRequest[];
};

export type TenderlyState = {
  mode: 'closed' | 'calls' | 'login' | 'request' | 'simulate' | 'result';
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  error?: SerializedError;
  credentials?: TenderlyCredentials;
  request?: SimulateRequest;
  result?: TenderlySimulatePayload;
};
