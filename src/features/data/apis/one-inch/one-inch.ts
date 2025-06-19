import type {
  IOneInchApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './one-inch-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { ChainConfig } from '../config-types.ts';
import { API_ZAP_URL } from '../beefy/beefy-api.ts';
import { getErrorMessageFromResponse } from '../transact/helpers/fetch.ts';
import { getJson } from '../../../../helpers/http/http.ts';
import { isFetchResponseError } from '../../../../helpers/http/errors.ts';

export const supportedChainIds: ChainConfig['id'][] = [
  'ethereum',
  'arbitrum',
  'optimism',
  'zksync',
  'base',
  'bsc',
  'polygon',
  'gnosis',
  'avax',
  'fantom',
  'aurora',
  'sonic',
];

export class OneInchApi implements IOneInchApi {
  protected api: string;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.includes(chain.id)) {
      throw new Error(`OneInch api is not supported on ${chain.id}`);
    }

    this.api = `${API_ZAP_URL}/providers/oneinch/${chain.id}`;
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean>,
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

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get<SwapResponse, SwapRequest>('/swap', request);
  }
}
