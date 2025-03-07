import type { SerializedError } from '@reduxjs/toolkit';
import type { ApiQuoteRequest, ApiQuoteResponse } from '../apis/on-ramp/on-ramp-types.ts';
import type { ChainEntity } from '../entities/chain.ts';

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
  allNetworks: ChainEntity['id'][];
  byNetwork: Record<string, Network>;
};
type Network = {
  id: string;
  allProviders: string[];
  byProvider: Record<string, Provider>;
  minFiat: number;
  maxFiat: number;
};
type Provider = {
  id: string;
  allMethods: string[];
  byMethod: Record<string, PaymentMethod>;
};
type PaymentMethod = {
  id: string;
  minLimit: undefined | number;
  maxLimit: undefined | number;
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
    value: string | undefined;
    error: CountryError | undefined;
  };
  fiat: {
    value: string | undefined;
    error: FiatError | undefined;
  };
  token: {
    value: string | undefined;
    error: TokenError | undefined;
  };
  network: {
    value: ChainEntity['id'] | undefined;
    error: NetworkError | undefined;
  };
  input: {
    value: number;
    error: InputError | undefined;
    mode: InputMode;
  };
  canQuote: boolean;
  allFiat: string[];
  byFiat: Record<string, Fiat>;
  quote: {
    requestId: string | undefined;
    status: 'idle' | 'pending' | 'rejected' | 'fulfilled';
    error: SerializedError | undefined;
    request: ApiQuoteRequest | undefined;
    response: ApiQuoteResponse | undefined;
    providers: string[];
    byProvider: Record<string, Quote>;
    provider: string | undefined;
    cheapestProvider: string | undefined;
  };
};
