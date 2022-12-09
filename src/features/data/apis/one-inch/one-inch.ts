import {
  IOneInchApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './one-inch-types';
import { ChainEntity } from '../../entities/chain';
import axios, { AxiosInstance } from 'axios';
import { errorToString } from '../transact/helpers/one-inch';

export class OneInchApi implements IOneInchApi {
  protected api: AxiosInstance;

  constructor(protected chain: ChainEntity) {
    this.api = axios.create({
      baseURL: `https://api.1inch.io/v5.0/${chain.networkChainId}/`,
    });
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    url: string,
    request: RequestType
  ): Promise<ResponseType> {
    try {
      const response = await this.api.get<ResponseType>(url, {
        headers: {
          Accept: 'application/json',
        },
        params: request,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(errorToString(error));
      } else {
        throw error;
      }
    }
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get('/quote', request);
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get('/swap', request);
  }
}
