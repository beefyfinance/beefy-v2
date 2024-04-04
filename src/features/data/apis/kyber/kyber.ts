import type {
  IKyberSwapApi,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './kyber-types';
import type { ChainEntity } from '../../entities/chain';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { axiosErrorToString } from '../transact/helpers/axios';
import type { ChainConfig } from '../config-types';
import { API_ZAP_URL } from '../beefy/beefy-api';

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
  protected api: AxiosInstance;

  constructor(protected chain: ChainEntity) {
    if (!supportedChainIds.includes(chain.id)) {
      throw new Error(`KyberSwap api is not supported on ${chain.id}`);
    }

    this.api = axios.create({
      baseURL: `${API_ZAP_URL}/providers/kyber/${chain.id}/`,
    });
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean | string[]>
  >(url: string, request: RequestType): Promise<ResponseType> {
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
        throw new Error(axiosErrorToString(error));
      } else {
        throw error;
      }
    }
  }

  protected async post<ResponseType extends object, RequestType extends Record<string, unknown>>(
    url: string,
    request: RequestType
  ): Promise<ResponseType> {
    try {
      const response = await this.api.post<ResponseType>(url, request, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(axiosErrorToString(error));
      } else {
        throw error;
      }
    }
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.post<SwapResponse, SwapRequest>('/swap', request);
  }
}
