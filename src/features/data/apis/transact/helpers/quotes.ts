import {
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  type ZapFee,
  type ZapQuoteStep,
  type TokenAmount,
} from '../transact-types';
import type { BeefyState } from '../../../../../redux-types';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import { selectTokenPriceByAddress } from '../../../selectors/tokens';
import type { BigNumber } from 'bignumber.js';
import type { QuoteResponse } from '../swap/ISwapProvider';

export const ZERO_FEE: ZapFee = { value: 0 };

/**
 * Returns the total value of the token amounts in USD
 */
export function totalValueOfTokenAmounts(
  tokenAmounts: TokenAmount[],
  state: BeefyState
): BigNumber {
  return tokenAmounts.reduce(
    (sum, tokenAmount) =>
      sum.plus(
        tokenAmount.amount.multipliedBy(
          selectTokenPriceByAddress(state, tokenAmount.token.chainId, tokenAmount.token.address)
        )
      ),
    BIG_ZERO
  );
}

/**
 * Returns the percentage difference between the input and output token amounts
 */
export function calculatePriceImpact(
  inputs: TokenAmount[],
  outputs: TokenAmount[],
  returned: TokenAmount[],
  state: BeefyState
): number {
  const inputAmount = inputs.length > 0 ? totalValueOfTokenAmounts(inputs, state) : BIG_ZERO;
  const outputAmount = outputs.length > 0 ? totalValueOfTokenAmounts(outputs, state) : BIG_ZERO;
  const returnedAmount = returned.length > 0 ? totalValueOfTokenAmounts(returned, state) : BIG_ZERO;
  const totalOutputAmount = outputAmount.plus(returnedAmount);

  // divide by zero check
  if (inputAmount.isZero()) {
    return 100;
  }

  return inputAmount.minus(totalOutputAmount).div(inputAmount).toNumber();
}

/**
 * Returns the highest fee from the given steps for display in the UI
 */
export function highestFeeOrZero(steps: ZapQuoteStep[]): ZapFee {
  return steps.reduce((maxFee, step) => {
    // only aggregator swap step has fee so far
    if (isZapQuoteStepSwap(step) && isZapQuoteStepSwapAggregator(step)) {
      if (step.fee.value > maxFee.value) {
        return step.fee;
      }
    }
    return maxFee;
  }, ZERO_FEE);
}

/**
 * Sort quotes by highest output amount first
 */
export function sortQuotes(quotes: QuoteResponse[]): QuoteResponse[] {
  return [...quotes].sort((a, b) => b.toAmount.comparedTo(a.toAmount));
}
