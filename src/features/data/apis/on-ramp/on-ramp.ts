import { getJson, postJson, postText } from '../../../../helpers/http';
import type {
  IOnRampApi,
  ApiQuoteRequest,
  ApiQuoteResponse,
  ApiSupportedResponse,
  ApiUrlRequest,
  ApiUrlResponse,
} from './on-ramp-types';

export class OnRampApi implements IOnRampApi {
  public api: string;

  constructor() {
    this.api = import.meta.env.VITE_ONRAMP_URL || 'https://onramp.beefy.finance';
  }

  public async getSupported(): Promise<ApiSupportedResponse> {
    return await getJson<ApiSupportedResponse>({ url: `${this.api}/onboard` });
  }

  public async getQuote(options: ApiQuoteRequest): Promise<ApiQuoteResponse> {
    return await postJson<ApiQuoteResponse>({
      url: `${this.api}/onboard/quote`,
      body: options,
    });
  }

  public async getUrl(options: ApiUrlRequest): Promise<ApiUrlResponse> {
    return await postText({
      url: `${this.api}/onboard/init`,
      body: options,
    });
  }
}
