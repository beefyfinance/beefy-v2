import type {
  IOneInchApi,
  PriceRequest,
  PriceResponse,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './one-inch-types';
import type { ChainEntity } from '../../entities/chain';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { errorToString } from '../transact/helpers/one-inch';
import type Web3 from 'web3';
import { MultiCall } from 'eth-multicall';
import { createContract } from '../../../../helpers/web3';
import { OneInchPriceOracleAbi } from '../../../../config/abi';
import BigNumber from 'bignumber.js';
import { getWeb3Instance } from '../instances';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.beefy.finance';

export class OneInchApi implements IOneInchApi {
  protected api: AxiosInstance;
  protected web3: Web3 | null = null;
  protected multicall: MultiCall | null = null;

  constructor(protected chain: ChainEntity, protected oracleAddress: string) {
    this.api = axios.create({
      baseURL: `${API_URL}/oneinch/${chain.id}/`,
    });
  }

  protected async get<
    ResponseType extends object,
    RequestType extends Record<string, string | number | boolean>
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
        throw new Error(errorToString(error));
      } else {
        throw error;
      }
    }
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get<QuoteResponse, QuoteRequest>('/quote', request);
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get<SwapResponse, SwapRequest>('/swap', request);
  }

  async getWeb3(): Promise<Web3> {
    if (this.web3 === null) {
      this.web3 = await getWeb3Instance(this.chain);
    }

    return this.web3;
  }

  async getMulticall(): Promise<MultiCall> {
    if (this.multicall === null) {
      this.multicall = new MultiCall(await this.getWeb3(), this.chain.multicallAddress);
    }

    return this.multicall;
  }

  async getPriceInNative(request: PriceRequest): Promise<PriceResponse> {
    if (!this.oracleAddress) {
      throw new Error(`No 1inch price oracle address for ${this.chain.id}`);
    }

    const multicall = await this.getMulticall();
    const contract = createContract(OneInchPriceOracleAbi, this.oracleAddress);
    const calls = request.tokenAddresses.map(address => ({
      address,
      price: contract.methods.getRateToEth(address, true),
    }));
    const [results] = (await multicall.all([calls])) as [{ address: string; price: string }[]];

    return results.reduce((acc, result) => {
      acc[result.address] = new BigNumber(result.price || '0');
      return acc;
    }, {} as PriceResponse);
  }
}
