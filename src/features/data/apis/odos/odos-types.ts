export type QuoteRequest = {
  inputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outputTokens: Array<{
    tokenAddress: string;
    proportion: number;
  }>;
  chainId: number;
  gasPrice?: string;
  userAddr?: string;
  slippageLimitPercent?: number;
  sourceWhitelist?: Array<string>;
  sourceBlacklist?: Array<string>;
  poolBlacklist?: Array<string>;
  referralCode?: number;
  simple?: boolean;
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

export type SwapRequest = {
  userAddr: string;
  pathId: string;
  receiver?: string;
  simulate?: boolean;
};

export type SwapResponse = {
  deprecated?: string;
  blockNumber: number;
  gasEstimate: number;
  gasEstimateValue: number;
  inputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  outputTokens: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  netOutValue: number;
  transaction: {
    gas: number;
    gasPrice: number;
    value: string;
    to: string;
    from: string;
    data: string;
    nonce: number;
    chainId: number;
  };
  simulation: {
    isSuccess: boolean;
    amountsOut: Array<number>;
    gasEstimate: number;
    simulationError: {
      type: string;
      errorMessage: string;
    };
  };
};

export interface IOdosApi {
  postQuote(request: QuoteRequest): Promise<QuoteResponse>;
  postSwap(request: SwapRequest): Promise<SwapResponse>;
}
