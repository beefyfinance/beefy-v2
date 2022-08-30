export type ApiSupportedResponse = {
  countryCode: string;
  currencyCode: string;
  providers: Record<ApiProviderName, ApiProvider>;
};

export type ApiProviderName = string;

export type ApiProvider = Record<ApiTokenSymbol, ApiToken>;

export type ApiTokenSymbol = string;

export type ApiMethod = {
  paymentMethod: string;
  minLimit: null | number;
  maxLimit: null | number;
};

export type ApiNetwork = string;

export type ApiFiatSymbol = string;

export type ApiToken = {
  fiatCurrencies: Record<ApiFiatSymbol, ApiMethod[]>;
  networks: ApiNetwork[];
};

export type ApiQuoteRequest = {
  cryptoCurrency: string;
  fiatCurrency: string;
  amountType: 'fiat' | 'crypto';
  amount: number;
  network: string;
  providers: ApiProviderName[];
};

export type ApiQuote = {
  quote: number;
  paymentMethod: string;
  fee: number;
};

export type ApiQuoteResponse = Record<ApiProviderName, ApiQuote[]>;

export type ApiUrlRequest = {
  cryptoCurrency: string;
  fiatCurrency: string;
  amountType: 'fiat' | 'crypto';
  amount: number;
  network: string;
  provider: string;
  paymentMethod: string;
  address?: string;
};

export type ApiUrlResponse = string;

export interface IOnRampApi {
  getSupported(): Promise<ApiSupportedResponse>;
  getQuote(options: ApiQuoteRequest): Promise<ApiQuoteResponse>;
  getUrl(options: ApiUrlRequest): Promise<ApiUrlResponse>;
}
