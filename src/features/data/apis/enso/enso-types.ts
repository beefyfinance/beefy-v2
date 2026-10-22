import type { ZapExtraQuoteResponse } from '../transact/transact-types.ts';

/** GET request to /quote with url params */
export type QuoteRequest = {
  /** input token address, native is lowercase 0xeeee...eeee */
  tokenIn: string;
  /** output token address, native is lowercase 0xeeee...eeee */
  tokenOut: string;
  /** wei string */
  amountIn: string;
};

export type QuoteResponse = {
  /** wei string */
  amountOut: string;
  /** in bps */
  priceImpact: number | null;
} & ZapExtraQuoteResponse;

/** GET request to /swap with url params */
export type SwapRequest = QuoteRequest & {
  /** caller of the enso router, receiver of the output and any refund */
  fromAddress: string;
  /** wei string, embedded in the calldata */
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
  amountOut: string;
  /** wei string */
  minAmountOut: string;
  gas: string;
  /** in bps */
  priceImpact: number | null;
  tx: SwapTx;
};

export interface IEnsoApi {
  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  getSwap(request: SwapRequest): Promise<SwapResponse>;
}
