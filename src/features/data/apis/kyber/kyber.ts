import type {
  IKyberSwapApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './kyber-types';
import type { ChainEntity } from '../../entities/chain';
import type { ChainConfig } from '../config-types';
import { API_ZAP_URL } from '../beefy/beefy-api';
import { getErrorMessageFromResponse, handleFetchParams } from '../transact/helpers/fetch';

export const supportedChainIds: ChainConfig['id'][] = [
  'ethereum',
  'polygon',
  'bsc',
  'optimism',
  'fantom',
  'arbitrum',
  'avax',
  'cronos',
  'zksync',
  'zkevm',
  'base',
  'linea',
  'aurora',
  'mantle',
];

export class KyberSwapApi implements IKyberSwapApi {
  protected api: string;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.includes(chain.id)) {
      throw new Error(`KyberSwap api is not supported on ${chain.id}`);
    }

    this.api = `${API_ZAP_URL}/providers/kyber/${chain.id}`;
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean | string[]>
  >(url: string, request: RequestType): Promise<ResponseType> {
    const res = await fetch(`${this.api}${url}?${handleFetchParams(request)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const error = await getErrorMessageFromResponse(res);
      throw new Error(error);
    }

    return await res.json();
  }

  protected async post<ResponseType extends object, RequestType extends Record<string, unknown>>(
    url: string,
    request: RequestType
  ): Promise<ResponseType> {
    const res = await fetch(`${this.api}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await getErrorMessageFromResponse(res);
      throw new Error(error);
    }

    return await res.json();
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.post<SwapResponse, SwapRequest>('/swap', request);
  }
}
