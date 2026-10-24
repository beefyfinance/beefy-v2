import { first } from 'lodash-es';
import { BIG_ZERO, toWei } from '../../../../../helpers/big-number.ts';
import { isTokenNative } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import { slipBy } from '../helpers/amounts.ts';
import { floorToSharedPrecision, isSameBalancePair } from '../helpers/tokens.ts';
import { getTokenAddress } from '../helpers/zap.ts';
import { selectSharedBalanceWrappedToken } from '../../../selectors/tokens.ts';
import { QuoteChangedError } from '../strategies/error.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import type { QuoteResponse } from '../swap/ISwapProvider.ts';
import type { ZapStepRequest, ZapStepResponse } from './types.ts';
import { buildTokenApproveTx } from './approve.ts';

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

  const sharedWnative = selectSharedBalanceWrappedToken(state, quote.fromToken.chainId);
  if (isSameBalancePair(quote.fromToken, quote.toToken, sharedWnative)) {
    // one balance: nothing to call, the next step's balance read already sees it
    const moved = [
      {
        token: quote.toToken,
        amount: floorToSharedPrecision(input.amount, input.token, sharedWnative),
      },
    ];
    return { inputs, outputs: moved, minOutputs: moved, returned: [], zaps: [] };
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

  if (swap.tx.approvalAddress && !isFromNative) {
    // the zap router only approves the step target, so approve the other spender in its own steps;
    // reset first: anyone can leave a router allowance via executeOrder, and usdt-style tokens
    // reject non-zero -> non-zero. the swap pulls the exact amount so nothing is left after
    return {
      inputs: inputs,
      outputs: [swapOutput],
      minOutputs: [swapOutputMin],
      returned: [],
      zaps: [
        buildTokenApproveTx(swap.fromToken.address, swap.tx.approvalAddress, BIG_ZERO),
        buildTokenApproveTx(
          swap.fromToken.address,
          swap.tx.approvalAddress,
          toWei(swap.fromAmount, swap.fromToken.decimals)
        ),
        {
          target: swap.tx.toAddress,
          data: swap.tx.data,
          value: swap.tx.value,
          tokens: [],
        },
      ],
    };
  }

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
          isFromNative && (!insertBalance || swap.tx.exactValue) ?
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
