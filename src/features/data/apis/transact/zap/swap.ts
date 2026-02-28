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
  const swapPair = `${inputs[0]?.token.symbol}->${outputs[0]?.token.symbol}`;
  const timerKey = `[XChainPerf] fetchZapAggregatorSwap(${providerId}:${swapPair})`;
  const fetchSwapTimerKey = `${timerKey}.fetchSwap`;
  console.time(timerKey);
  console.debug(`${timerKey} START`, {
    providerId,
    fromToken: inputs[0]?.token.symbol,
    fromAmount: inputs[0]?.amount.toString(10),
    toToken: outputs[0]?.token.symbol,
    toAmount: outputs[0]?.amount.toString(10),
    maxSlippage,
    insertBalance,
  });
  if (inputs.length !== 1 || outputs.length !== 1) {
    console.timeEnd(timerKey);
    throw new Error(`Invalid swap request`);
  }

  const output = first(outputs)!; // we checked length above

  console.time(fetchSwapTimerKey);
  const swap = await swapAggregator.fetchSwap(
    request.providerId,
    {
      fromAddress: zapRouter,
      slippage: maxSlippage,
      quote,
    },
    state
  );
  console.timeEnd(fetchSwapTimerKey);
  console.debug(`${fetchSwapTimerKey} result`, {
    providerId,
    toAmount: swap.toAmount.toString(10),
    toAmountMin: swap.toAmountMin.toString(10),
  });

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

  console.timeEnd(timerKey);
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
