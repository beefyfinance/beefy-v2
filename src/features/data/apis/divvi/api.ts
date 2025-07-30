import type { Hash } from 'viem';
import { postJson } from '../../../../helpers/http/http.ts';
import {
  type DivviSubmitRequest,
  type DivviSubmitResponse,
  type IDivviApi,
  SubmitStatus,
} from './types.ts';

export const API_URL = import.meta.env.VITE_API_URL || 'https://api.beefy.finance';

export class DivviApi implements IDivviApi {
  private pending: Map<Hash, number> = new Map();

  markPending(chainId: number, hash: Hash): void {
    this.pending.set(hash, chainId);
  }

  markReverted(hash: Hash): void {
    this.removePending(hash);
  }

  markConfirmed(hash: Hash): void {
    const chainId = this.removePending(hash);
    if (chainId) {
      this.submit(chainId, hash).catch(error => {
        console.error(`Failed to submit ref for transaction ${hash} on chain ${chainId}:`, error);
      });
    }
  }

  private removePending(hash: Hash): number | false {
    const chainId = this.pending.get(hash);
    if (chainId !== undefined) {
      this.pending.delete(hash);
      return chainId;
    }
    return false;
  }

  private async submit(chainId: number, hash: Hash): Promise<void> {
    const response = await postJson<DivviSubmitResponse>({
      url: `${API_URL}/ref/divvi`,
      body: {
        chainId,
        hash,
      } satisfies DivviSubmitRequest,
    });
    if (response.status !== SubmitStatus.SUBMITTED) {
      throw new Error(`status != submitted: ${response.status}`);
    }
  }
}
