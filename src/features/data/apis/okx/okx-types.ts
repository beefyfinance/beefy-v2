import type { ZapExtraQuoteResponse } from '../transact/transact-types.ts';

/** GET request to /quote with url params */
export type QuoteRequest = {
  /** input token address, native is lowercase 0xeeee...eeee */
  tokenIn: string;
  /** output token address, native is lowercase 0xeeee...eeee */
  tokenOut: string;
  /** wei string */
  amountIn: string;
  /** okx disableRFQ, for swaps executed later (cross-chain) */
  excludeRfq?: 'true';
  /** comma-separated okx dexIds to skip */
  excludeDexIds?: string;
};

/** raw okx quote data, only the fields we use */
export type QuoteResponse = {
  /** wei string */
  toTokenAmount: string;
  /** percent */
  priceImpactPercent: string;
} & ZapExtraQuoteResponse;

/** GET request to /swap with url params */
export type SwapRequest = QuoteRequest & {
  /** caller of the okx router and receiver of the output */
  fromAddress: string;
  /** fraction e.g. 0.01 for 1% */
  slippage: string;
  /** wei string, the swap is rejected if okx's min out is below this */
  minAmountOut: string;
};

export type SwapTx = {
  to: string;
  from?: string;
  data: string;
  /** wei string */
  value: string;
};

export type SwapResponse = {
  /** wei string */
  toAmount: string;
  /** wei string */
  minToAmount: string;
  /** percent */
  priceImpactPercent: string;
  gas: string;
  tx: SwapTx;
  /** spender to approve for erc20 input, not tx.to */
  approveAddress?: string;
};

export interface IOkxApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  getSwap(request: SwapRequest): Promise<SwapResponse>;
}
