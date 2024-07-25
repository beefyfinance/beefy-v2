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
    const res = await fetch(`${this.api}/onboard`);

    if (!res.ok) {
      if (res.status === 404) {
        return {
          countryCode: '',
          currencyCode: '',
          providers: {},
        } as ApiSupportedResponse;
      }
    }

    const data = await res.json();

    return data.data;
  }

  public async getQuote(options: ApiQuoteRequest): Promise<ApiQuoteResponse> {
    const res = await fetch(`${this.api}/onboard/quote`, {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return {} as ApiQuoteResponse;
      }
    }

    const data = await res.json();

    return data.data;
  }

  public async getUrl(options: ApiUrlRequest): Promise<ApiUrlResponse> {
    const res = await fetch(`${this.api}/onboard/init`, {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return '' as ApiUrlResponse;
      }
    }

    const data = await res.json();

    return data.data;
  }
}
