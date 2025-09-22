import type {
  ILiquidSwapApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './liquid-swap-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { API_ZAP_URL } from '../beefy/beefy-api.ts';
import { getErrorMessageFromResponse } from '../transact/helpers/fetch.ts';
import { getJson, postJson } from '../../../../helpers/http/http.ts';
import { isFetchResponseError } from '../../../../helpers/http/errors.ts';

export const supportedChainIds = new Set<ChainEntity['id']>(['hyperevm']);

export class LiquidSwapApi implements ILiquidSwapApi {
  protected api: string;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.has(chain.id)) {
      throw new Error(`LiquidSwap api is not supported on ${chain.id}`);
    }

    this.api = `${API_ZAP_URL}/providers/liquid-swap/${chain.id}`;
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.post<SwapResponse, SwapRequest>('/swap', request);
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean | string[]>,
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
}
