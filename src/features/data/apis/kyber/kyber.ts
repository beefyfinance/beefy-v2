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
import { getErrorMessageFromResponse } from '../transact/helpers/fetch';
import { getJson, postJson } from '../../../../helpers/http';
import { isFetchResponseError } from '../../../../helpers/http/errors';

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
    try {
      return await getJson<ResponseType>({
        url: `${this.api}${url}`,
        params: request,
      });
    } catch (error: unknown) {
      if (isFetchResponseError(error)) {
        const message = await getErrorMessageFromResponse(error.response);
        if (message) {
          throw new Error(message);
        }
      }
      throw error;
    }
  }

  protected async post<ResponseType extends object, RequestType extends Record<string, unknown>>(
    url: string,
    request: RequestType
  ): Promise<ResponseType> {
    try {
      return await postJson<ResponseType>({
        url: `${this.api}${url}`,
        body: request,
      });
    } catch (error: unknown) {
      if (isFetchResponseError(error)) {
        const message = await getErrorMessageFromResponse(error.response);
        if (message) {
          throw new Error(message);
        }
      }
      throw error;
    }
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.post<SwapResponse, SwapRequest>('/swap', request);
  }
}
