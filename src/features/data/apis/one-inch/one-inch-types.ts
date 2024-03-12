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
  srcToken: QuoteToken;
  dstToken: QuoteToken;
  dstAmount: string;
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
  srcToken: QuoteToken;
  dstToken: QuoteToken;
  dstAmount: string;
  tx: SwapTx;
};

export interface IOneInchApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  getSwap(request: SwapRequest): Promise<SwapResponse>;
}
