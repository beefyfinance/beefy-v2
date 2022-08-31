import { SerializedError } from '@reduxjs/toolkit';
import { ApiQuoteRequest, ApiQuoteResponse } from '../apis/on-ramp/on-ramp-types';

export enum FormStep {
  UnsupportedCountry = 1,
  SelectToken,
  SelectNetwork,
  SelectFiat,
  InputAmount,
  SelectProvider,
  InjectProvider,
}

export enum CountryError {
  NotSelected = 1,
  NotSupported,
}

export enum FiatError {
  NotSelected = 1,
  NotSupported,
}

export enum TokenError {
  NotSelected = 1,
  NotSupported,
}

export enum NetworkError {
  NotSelected = 1,
  NotSupported,
}

export enum InputError {
  NotEntered = 1,
  OutOfRange,
}

export enum InputMode {
  Fiat,
  Token,
}

type Fiat = {
  id: string;
  allTokens: string[];
  byToken: Record<string, Token>;
};
type Token = {
  id: string;
  allNetworks: string[];
  minFiat: number;
  maxFiat: number;
  byNetwork: Record<string, Network>;
};
type Network = {
  id: string;
  allProviders: string[];
  byProvider: Record<string, Provider>;
};
type Provider = {
  id: string;
  allMethods: string[];
  byMethod: Record<string, PaymentMethod>;
};
type PaymentMethod = {
  id: string;
  minLimit: null | number;
  maxLimit: null | number;
};
export type Quote = {
  provider: string;
  network: string;
  amountType: 'token' | 'fiat';
  fiatAmount: number;
  fiat: string;
  rate: number;
  tokenAmount: number;
  token: string;
  paymentMethod: string;
};
export type OnRampTypes = {
  step: FormStep;
  lastStep: FormStep;
  country: {
    value: string | null;
    error: CountryError | null;
  };
  fiat: {
    value: string | null;
    error: FiatError | null;
  };
  token: {
    value: string | null;
    error: TokenError | null;
  };
  network: {
    value: string | null;
    error: NetworkError | null;
  };
  input: {
    value: number | null;
    error: InputError | null;
    mode: InputMode;
  };
  canQuote: boolean;
  allFiat: string[];
  byFiat: Record<string, Fiat>;
  quote: {
    requestId: string | null;
    status: 'idle' | 'pending' | 'rejected' | 'fulfilled';
    error: SerializedError | null;
    request: ApiQuoteRequest | null;
    response: ApiQuoteResponse | null;
    providers: string[];
    byProvider: Record<string, Quote>;
    provider: string | null;
    cheapestProvider: string | null;
  };
};
