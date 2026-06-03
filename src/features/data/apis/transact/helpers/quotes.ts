import type BigNumber from 'bignumber.js';
import { BIG_ZERO, compareBigNumber } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectVaultSharesToDepositTokenData } from '../../../selectors/balance.ts';
import { selectTokenPriceByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { mooAmountToOracleAmount } from '../../../utils/ppfs.ts';
import type { QuoteResponse } from '../swap/ISwapProvider.ts';
import {
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  type TokenAmount,
  type ZapFee,
  type ZapQuoteStep,
} from '../transact-types.ts';

export const ZERO_FEE: ZapFee = { value: 0 };

/** Convert a v2v source share amount to the deposit-token TokenAmount via ppfs (pass-through for vaults without a receipt token). */
export function convertVaultShareToDepositTokenAmount(
  state: BeefyState,
  srcVaultId: VaultEntity['id'],
  shareAmount: BigNumber
): TokenAmount {
  const { depositToken, shareToken, ppfs } = selectVaultSharesToDepositTokenData(state, srcVaultId);
  if (shareAmount.lte(BIG_ZERO)) return { token: depositToken, amount: BIG_ZERO };
  if (!shareToken) return { token: depositToken, amount: shareAmount };
  return {
    token: depositToken,
    amount: mooAmountToOracleAmount(shareToken, depositToken, ppfs, shareAmount),
  };
}

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
