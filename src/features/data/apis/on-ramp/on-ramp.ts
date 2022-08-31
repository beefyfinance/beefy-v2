import axios, { AxiosInstance } from 'axios';
import {
  IOnRampApi,
  ApiQuoteRequest,
  ApiQuoteResponse,
  ApiSupportedResponse,
  ApiUrlRequest,
  ApiUrlResponse,
} from './on-ramp-types';

export class OnRampApi implements IOnRampApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_ONRAMP_URL || 'https://onramp.beefy.finance',
    });
  }

  public async getSupported(): Promise<ApiSupportedResponse> {
    const res = await this.api.get<ApiSupportedResponse>('/onboard');
    return res.data;
  }

  public async getQuote(options: ApiQuoteRequest): Promise<ApiQuoteResponse> {
    const res = await this.api.post<ApiQuoteResponse>('/onboard/quote', options);
    return res.data;
  }

  public async getUrl(options: ApiUrlRequest): Promise<ApiUrlResponse> {
    const res = await this.api.post<ApiUrlResponse>('/onboard/init', options);
    return res.data;
  }
}
