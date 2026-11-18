import type {
  IEnsoApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './enso-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { ChainConfig } from '../config-types.ts';
import { API_ZAP_URL } from '../beefy/beefy-api.ts';
import { getErrorMessageFromResponse } from '../transact/helpers/fetch.ts';
import { getJson } from '../../../../helpers/http/http.ts';
import { isFetchResponseError } from '../../../../helpers/http/errors.ts';

export const supportedChainIds: ChainConfig['id'][] = [
  'ethereum',
  'bsc',
  'arbitrum',
  'polygon',
  'optimism',
  'avax',
  'base',
  'hyperevm',
  'plasma',
  'monad',
  'megaeth',
  'robinhood',
  'arc',
];

export class EnsoApi implements IEnsoApi {
  protected api: string;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.includes(chain.id)) {
      throw new Error(`Enso api is not supported on ${chain.id}`);
    }

    this.api = `${API_ZAP_URL}/providers/enso/${chain.id}`;
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean>,
  >(url: string, request: RequestType, timeout?: number): Promise<ResponseType> {
    try {
      return await getJson<ResponseType>({
        url: `${this.api}${url}`,
        params: request,
        timeout,
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

  async getQuote(request: QuoteRequest, timeoutMs?: number): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request, timeoutMs);
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get<SwapResponse, SwapRequest>('/swap', request);
  }
}
