import type BigNumber from 'bignumber.js';
import { first } from 'lodash-es';
import { BIG_ZERO, compareBigNumber } from '../../../../../helpers/big-number.ts';
import { selectTokenPriceByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { QuoteResponse } from '../swap/ISwapProvider.ts';
import type { QuoteSelectionConfig } from '../strategies/strategy-configs.ts';
import {
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  type TokenAmount,
  type ZapFee,
  type ZapQuoteStep,
} from '../transact-types.ts';

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
  state: BeefyState,
  knownFeesUsd: BigNumber = BIG_ZERO // bridge fees that don't reflect price movement due to poor swapping/routing
): number {
  const inputAmount = inputs.length > 0 ? totalValueOfTokenAmounts(inputs, state) : BIG_ZERO;
  const outputAmount = outputs.length > 0 ? totalValueOfTokenAmounts(outputs, state) : BIG_ZERO;
  const returnedAmount = returned.length > 0 ? totalValueOfTokenAmounts(returned, state) : BIG_ZERO;
  const totalOutputAmount = outputAmount.plus(returnedAmount);
  const effectiveInput = inputAmount.minus(knownFeesUsd);

  // divide by zero check
  if (effectiveInput.lte(BIG_ZERO)) {
    return 100;
  }

  return effectiveInput.minus(totalOutputAmount).div(effectiveInput).toNumber();
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
  return [...quotes].sort((a, b) => compareBigNumber(b.toAmount, a.toAmount));
}

/**
 * Select the best quote per swap from quotesPerSwap, respecting maxUsesPerProvider limits.
 * When no limits are provided or quotesPerSwap has ≤1 entry, falls back to first() per swap.
 *
 * @param quotesPerSwap - Array of sorted quote arrays, one per swap (e.g. 2 for dual-token LPs)
 * @param swapConfig - Optional config with maxUsesPerProvider and maxUsesStrict
 * @returns Array of one winning QuoteResponse per swap
 */
export function selectQuotesRespectingProviderLimits(
  quotesPerSwap: (QuoteResponse[] | undefined)[],
  state: BeefyState,
  quoteSelection?: QuoteSelectionConfig
): (QuoteResponse | undefined)[] {
  const maxUses = quoteSelection?.maxUsesPerProvider;

  // No limits or single swap — just pick first (best) per swap
  if (!maxUses || quotesPerSwap.length <= 1) {
    return quotesPerSwap.map(quotes => first(quotes));
  }

  // Filter to swaps that have quotes
  const definedIndices: number[] = [];
  const definedQuotes: QuoteResponse[][] = [];
  for (let i = 0; i < quotesPerSwap.length; i++) {
    const quotes = quotesPerSwap[i];
    if (quotes && quotes.length > 0) {
      definedIndices.push(i);
      definedQuotes.push(quotes);
    }
  }

  // 0 or 1 defined swaps — no combinatorial needed
  if (definedQuotes.length <= 1) {
    return quotesPerSwap.map(quotes => first(quotes));
  }

  // Generate cartesian product and find best valid combination
  const combinations = cartesianProduct(definedQuotes);
  let bestCombo: QuoteResponse[] | undefined;
  let bestTotal: BigNumber = BIG_ZERO;

  for (const combo of combinations) {
    if (isWithinProviderLimits(combo, maxUses)) {
      const total = combo.reduce(
        (sum, q) =>
          sum.plus(
            q.toAmount.multipliedBy(
              selectTokenPriceByAddress(state, q.toToken.chainId, q.toToken.address)
            )
          ),
        BIG_ZERO
      );
      if (!bestCombo || total.gt(bestTotal)) {
        bestCombo = combo;
        bestTotal = total;
      }
    }
  }

  if (bestCombo) {
    // Map back to original indices
    const result: (QuoteResponse | undefined)[] = quotesPerSwap.map(() => undefined);
    for (let i = 0; i < definedIndices.length; i++) {
      result[definedIndices[i]] = bestCombo[i];
    }
    return result;
  }

  // No valid combination found
  if (quoteSelection?.maxUsesStrict) {
    throw new Error(
      `No valid quote combination found respecting provider limits: ${JSON.stringify(maxUses)}`
    );
  }

  console.warn(
    '[quotes] Could not find quote combination respecting provider limits, falling back to best per swap',
    maxUses
  );
  return quotesPerSwap.map(quotes => first(quotes));
}

function isWithinProviderLimits(
  combo: QuoteResponse[],
  maxUses: Partial<Record<string, number>>
): boolean {
  const counts: Record<string, number> = {};
  for (const quote of combo) {
    counts[quote.providerId] = (counts[quote.providerId] || 0) + 1;
    const limit = maxUses[quote.providerId];
    if (limit !== undefined && counts[quote.providerId] > limit) {
      return false;
    }
  }
  return true;
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap(combo => curr.map(item => [...combo, item])),
    [[]]
  );
}
