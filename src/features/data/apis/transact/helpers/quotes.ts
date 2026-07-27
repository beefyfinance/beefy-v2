import type BigNumber from 'bignumber.js';
import { BIG_ZERO, compareBigNumber } from '../../../../../helpers/big-number.ts';
import { isTokenEqual, type TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectVaultSharesToDepositTokenData } from '../../../selectors/balance.ts';
import { selectTokenPriceByAddressReceiptAware } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { mooAmountToOracleAmount } from '../../../utils/ppfs.ts';
import type { QuoteResponse } from '../swap/ISwapProvider.ts';
import {
  isCowcentratedDepositQuote,
  isCrossChainDepositQuote,
  isVaultToVaultSingleTokenDepositQuote,
  type TokenAmount,
  type TransactQuote,
  type ZapFee,
} from '../transact-types.ts';
import { isVaultDestState } from '../handlers/types.ts';

export const ZERO_FEE: ZapFee = { value: 0 };

/**
 * The quote to render the result against. Unwraps a dest-composed deposit (cross-chain, or same-chain vault-to-vault)
 * to its real dest deposit quote so a CLM destination shows its position breakdown rather than just the share token;
 * all other quotes pass through unchanged.
 */
export function getEffectiveQuote(quote: TransactQuote): TransactQuote {
  if (!isCrossChainDepositQuote(quote) && !isVaultToVaultSingleTokenDepositQuote(quote)) {
    return quote;
  }
  const { state } = quote.destHandlerQuote;
  return isVaultDestState(state) ? state.destQuote : quote;
}

/** false for any quote where there is exactly one matching input+output token else true; the vault's receipt token counts as its deposit token */
export function quoteHasTransformation(
  quote: TransactQuote,
  vaultShares: { depositToken: TokenEntity; shareToken?: TokenEntity }
): boolean {
  if (isCowcentratedDepositQuote(getEffectiveQuote(quote))) {
    return true;
  }
  if (quote.returned.some(r => r.amount.gt(BIG_ZERO))) {
    return true;
  }
  if (quote.outputs.length > 1) {
    return true;
  }
  const firstInput = quote.inputs[0];
  const firstOutput = quote.outputs[0];
  if (!firstInput || !firstOutput) {
    return false;
  }
  const { depositToken, shareToken } = vaultShares;
  const inputToken =
    shareToken && isTokenEqual(firstInput.token, shareToken) ? depositToken : firstInput.token;
  const outputToken =
    shareToken && isTokenEqual(firstOutput.token, shareToken) ? depositToken : firstOutput.token;
  return inputToken.address !== outputToken.address || inputToken.chainId !== outputToken.chainId;
}

/** Convert a vault share amount to its deposit-token equivalent via ppfs; pass-through for vaults without a receipt token. */
export function convertVaultShareToDepositTokenAmount(
  state: BeefyState,
  srcVaultId: VaultEntity['id'],
  shareAmount: BigNumber
): TokenAmount {
  const { depositToken, shareToken, ppfs } = selectVaultSharesToDepositTokenData(state, srcVaultId);
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
          selectTokenPriceByAddressReceiptAware(
            state,
            tokenAmount.token.chainId,
            tokenAmount.token.address
          )
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
 * Sort quotes by highest output amount first
 */
export function sortQuotes(quotes: QuoteResponse[]): QuoteResponse[] {
  return [...quotes].sort((a, b) => compareBigNumber(b.toAmount, a.toAmount));
}
