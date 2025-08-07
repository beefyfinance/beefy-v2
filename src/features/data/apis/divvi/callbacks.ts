import type { Hash } from 'viem';
import { getDivviApi } from '../instances.ts';
import type { IDivviApi } from './types.ts';

function withDivviApi<T>(fn: (api: IDivviApi) => T) {
  try {
    getDivviApi()
      .then(api => fn(api))
      .catch(error => {
        console.error(`Unhandled promise rejection while executing ref callback.`, error);
      });
  } catch (error) {
    console.error(`Unhandled error while executing ref callback.`, error);
  }
}

export function refTxSentCallback(chainId: number, hash: Hash) {
  withDivviApi(api => {
    api.markPending(chainId, hash);
  });
}

export function refTxRevertedCallback(hash: Hash) {
  withDivviApi(api => {
    api.markReverted(hash);
  });
}

export function refTxConfirmedCallback(hash: Hash) {
  withDivviApi(api => {
    api.markConfirmed(hash);
  });
}
