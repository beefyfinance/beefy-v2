import { postJson } from '../../../../helpers/http/http.ts';
import { isFetchResponseError } from '../../../../helpers/http/errors.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { API_ZAP_URL } from '../beefy/beefy-api.ts';
import type { ChainConfig } from '../config-types.ts';
import { getErrorMessageFromResponse } from '../transact/helpers/fetch.ts';
import type {
  IOdosApi,
  QuoteRequestV3,
  QuoteResponseV3,
  SwapRequestV3,
  SwapResponseV3,
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
      throw new Error(`Odos api is not supported on ${chain.id}`);
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

  async postQuote(request: QuoteRequestV3): Promise<QuoteResponseV3> {
    return await this.post<QuoteResponseV3, QuoteRequestV3>('/quote', request);
  }

  async postSwap(request: SwapRequestV3): Promise<SwapResponseV3> {
    const response = await this.post<SwapResponseV3, SwapRequestV3>('/swap', request);
    if (response.transaction.to !== '0x0D05a7D3448512B78fa8A9e46c4872C88C4a0D05') {
      throw new Error(
        `Unexpected Odos Router router address found in transaction data: ${response.transaction.to}`
      );
    }
    return response;
  }
}
