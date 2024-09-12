export type QuoteRequest = {
  inputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outputTokens: Array<{
    tokenAddress: string;
    proportion: number;
  }>;
  gasPrice?: string;
  userAddr?: string;
  slippageLimitPercent?: number;
  sourceWhitelist?: Array<string>;
  sourceBlacklist?: Array<string>;
  poolBlacklist?: Array<string>;
  referralCode?: number;
};

export type QuoteResponse = {
  inTokens: Array<string>;
  outTokens: Array<string>;
  inAmounts: Array<string>;
  outAmounts: Array<string>;
  gasEstimate: number;
  dataGasEstimate: number;
  gweiPerGas: number;
  gasEstimateValue: number;
  inValues: Array<number>; // usd
  outValues: Array<number>; // usd
  netOutValue: number;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  blockNumber: number;
};

export type SwapRequest = {};

export type SwapResponse = {};

export interface IOdosApi {
  postQuote(request: QuoteRequest): Promise<QuoteResponse>;
  postSwap(request: any): Promise<any>;
}
