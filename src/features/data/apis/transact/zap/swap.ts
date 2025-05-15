import { first } from 'lodash-es';
import { isTokenNative } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getTokenAddress } from '../helpers/zap.ts';
import { QuoteChangedError } from '../strategies/error.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import type { QuoteResponse } from '../swap/ISwapProvider.ts';
import type { ZapStepRequest, ZapStepResponse } from './types.ts';

export type ZapAggregatorSwapRequest = ZapStepRequest & {
  providerId: string;
  quote: QuoteResponse;
};

export type ZapAggregatorSwapResponse = ZapStepResponse;

export async function fetchZapAggregatorSwap(
  request: ZapAggregatorSwapRequest,
  swapAggregator: ISwapAggregator,
  state: BeefyState
): Promise<ZapAggregatorSwapResponse> {
  const { inputs, outputs, maxSlippage, zapRouter, providerId, insertBalance, quote } = request;
  if (inputs.length !== 1 || outputs.length !== 1) {
    throw new Error(`Invalid swap request`);
  }

  const output = first(outputs)!; // we checked length above

  const swap = await swapAggregator.fetchSwap(
    request.providerId,
    {
      fromAddress: zapRouter,
      slippage: maxSlippage,
      quote,
    },
    state
  );

  const quoteMin = output.amount.times(maxSlippage);
  if (swap.toAmountMin.lt(quoteMin)) {
    console.error('QuoteChangedError', { quote, swap });
    throw new QuoteChangedError(
      `Expected swap output amount changed between quote and execution for ${providerId}`
    );
  }

  const swapOutput = {
    token: swap.toToken,
    amount: swap.toAmount,
  };

  const swapOutputMin = {
    token: swap.toToken,
    amount: swap.toAmountMin,
  };

  const isFromNative = isTokenNative(swap.fromToken);

  return {
    inputs: inputs,
    outputs: [swapOutput],
    minOutputs: [swapOutputMin],
    returned: [],
    zaps: [
      {
        target: swap.tx.toAddress,
        data: swap.tx.data,
        value: swap.tx.value,
        tokens:
          isFromNative && !insertBalance ?
            []
          : [
              {
                token: getTokenAddress(swap.fromToken),
                index: insertBalance && !isFromNative ? swap.tx.inputPosition : -1, // use all balance : set allowance only
              },
            ],
      },
    ],
  };
}
