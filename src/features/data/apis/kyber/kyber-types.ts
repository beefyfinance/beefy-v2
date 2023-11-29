export type QuoteRequest = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  saveGas?: boolean;
  includedSources?: string[];
  excludedSources?: string[];
  gasInclude?: boolean;
  gasPrice?: string;
} & Partial<ExtraFee>;

export type ExtraFee = {
  /** in bps if isInBps is true (10 means 0.1%), otherwise in wei */
  feeAmount: string;
  chargeFeeBy: string;
  isInBps: boolean;
  feeReceiver: string;
};

export type SwapRoute = {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  limitReturnAmount: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolLength: string;
  poolType: string;
  extra: string;
};

export type RouteSummary = {
  tokenIn: string;
  amountIn: string;
  amountInUsd: string;
  tokenOut: string;
  amountOut: string;
  amountOutUsd: string;
  gas: string;
  gasPrice: string;
  gasUsd: string;
  extraFee: ExtraFee;
  route: SwapRoute[];
};

export type QuoteResponse = {
  routeSummary: RouteSummary;
  routeAddress: string;
};

export type SwapRequest = {
  routeSummary: RouteSummary;
  deadline?: number; // unix timestamp, default +20minutes
  /** in bps, 10 means 0.1% */
  slippageTolerance?: number;
  sender: string;
  recipient: string;
};

export type SwapResponse = {
  amountIn: string;
  amountInUsd: string;
  amountOut: string;
  amountOutUsd: string;
  gas: string;
  gasUsd: string;
  outputChange: unknown; // deprecated
  data: string;
  routerAddress: string;
};

export interface IKyberSwapApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  postSwap(request: SwapRequest): Promise<SwapResponse>;
}
