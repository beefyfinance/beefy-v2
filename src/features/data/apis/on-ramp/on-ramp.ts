import axios, { AxiosInstance } from 'axios';
import {
  IOnRampApi,
  ApiQuoteRequest,
  ApiQuoteResponse,
  ApiSupportedResponse,
  ApiBinanceSignRequest,
  ApiBinanceSignResponse,
  ApiUrlRequest,
  ApiUrlResponse,
} from './on-ramp-types';

export class OnRampApi implements IOnRampApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://beefy-binance-connect-api.herokuapp.com',
    });
  }

  public async getSupported(): Promise<ApiSupportedResponse> {
    const res = await this.api.get<ApiSupportedResponse>('/binance/onboard');
    return res.data;
  }

  public async getQuote(options: ApiQuoteRequest): Promise<ApiQuoteResponse> {
    const res = await this.api.post<ApiQuoteResponse>('/binance/quote', options);
    return res.data;
  }

  public async getBinanceSignature(
    options: ApiBinanceSignRequest
  ): Promise<ApiBinanceSignResponse> {
    const res = await this.api.post<ApiBinanceSignResponse>('/binance/sign', options);
    return res.data;
  }

  public async getUrl(options: ApiUrlRequest): Promise<ApiUrlResponse> {
    const res = await this.api.post<ApiUrlResponse>('/binance/init', options);
    return res.data;
  }
}
