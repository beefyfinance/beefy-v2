import { first } from 'lodash-es';
import { isTokenNative } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import { slipBy } from '../helpers/amounts.ts';
import {
  floorToSharedPrecision,
  isSameBalancePair,
  nativeAndWrappedAreSame,
} from '../helpers/tokens.ts';
import { getTokenAddress } from '../helpers/zap.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
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

  const input = first(inputs)!;
  const output = first(outputs)!; // we checked length above

  const { chainId } = quote.fromToken;
  if (nativeAndWrappedAreSame(chainId)) {
    const wnative = selectChainWrappedNativeToken(state, chainId);
    if (isSameBalancePair(quote.fromToken, quote.toToken, wnative)) {
      // one balance: nothing to call, the next step's balance read already sees it
      const moved = [
        {
          token: quote.toToken,
          amount: floorToSharedPrecision(input.amount, input.token, wnative),
        },
      ];
      return { inputs, outputs: moved, minOutputs: moved, returned: [], zaps: [] };
    }
  }

  const swap = await swapAggregator.fetchSwap(
    request.providerId,
    {
      fromAddress: zapRouter,
      slippage: maxSlippage,
      quote,
    },
    state
  );

  const quoteMin = slipBy(output.amount, maxSlippage, output.token.decimals);
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
