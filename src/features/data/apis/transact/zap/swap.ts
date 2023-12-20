import type { ISwapAggregator } from '../swap/ISwapAggregator';
import type { BeefyState } from '../../../../../redux-types';
import { getTokenAddress } from '../helpers/zap';
import type { ZapStepRequest, ZapStepResponse } from './types';
import { first } from 'lodash-es';
import { isTokenNative } from '../../../entities/token';
import type { QuoteResponse } from '../swap/ISwapProvider';

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

  const output = first(outputs);

  const swap = await swapAggregator.fetchSwap(
    request.providerId,
    {
      fromAddress: zapRouter,
      slippage: maxSlippage,
      quote,
    },
    state
  );

  if (swap.toAmount.lt(output.amount)) {
    throw new Error(`Swap via ${providerId} returned less than expected`);
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
          isFromNative && !insertBalance
            ? []
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
