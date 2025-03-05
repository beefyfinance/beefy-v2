import { postJson } from '../../../../helpers/http/http.ts';
import { isFetchResponseError } from '../../../../helpers/http/errors.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { API_ZAP_URL } from '../beefy/beefy-api.ts';
import type { ChainConfig } from '../config-types.ts';
import { getErrorMessageFromResponse } from '../transact/helpers/fetch.ts';
import type {
  IOdosApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './odos-types.ts';

export const supportedChainIds: ChainConfig['id'][] = [
  'ethereum',
  'zksync',
  'base',
  'mantle',
  'polygon',
  'optimism',
  'mode',
  'avax',
  'linea',
  'arbitrum',
  'bsc',
  'fantom',
  'scroll',
  'sonic',
];

export class OdosApi implements IOdosApi {
  protected api: string;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.includes(chain.id)) {
      throw new Error(`OneInch api is not supported on ${chain.id}`);
    }
    this.api = `${API_ZAP_URL}/providers/odos/${chain.id}`;
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

  async postQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.post<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.post<SwapResponse, SwapRequest>('/swap', request);
  }
}
