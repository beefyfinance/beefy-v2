import type BigNumber from 'bignumber.js';

export type QuoteRequest = {
  src: string;
  dst: string;
  amount: string;
  fee?: string;
};

export type QuoteToken = {
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  tags: string[];
};

export type QuoteResponse = {
  fromToken: QuoteToken;
  toToken: QuoteToken;
  toAmount: string;
};

export type SwapRequest = {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  fee?: string;
  referrer?: string;
  disableEstimate?: boolean;
};

export type SwapTx = {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
};

export type SwapResponse = {
  fromToken: QuoteToken;
  toToken: QuoteToken;
  toAmount: string;
  tx: SwapTx;
};

export type PriceRequest = {
  tokenAddresses: string[];
};

export type PriceResponse = Record<string, BigNumber>;

export interface IOneInchApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  getSwap(request: SwapRequest): Promise<SwapResponse>;

  getPriceInNative(request: PriceRequest): Promise<PriceResponse>;
}
