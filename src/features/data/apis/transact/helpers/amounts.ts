import type { TokenAmount } from '../transact-types.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import BigNumber from 'bignumber.js';
import { BIG_ZERO, toWei } from '../../../../../helpers/big-number.ts';
import { groupBy } from 'lodash-es';

export function tokenAmountToWei(tokenAmount: TokenAmount): BigNumber {
  return toWei(tokenAmount.amount, tokenAmount.token.decimals);
}

export function slipBy(amount: BigNumber, slippage: number, decimals: number): BigNumber {
  return amount.multipliedBy(1 - slippage).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

export function slipTokenAmountBy(tokenAmount: TokenAmount, slippage: number): TokenAmount {
  return {
    token: tokenAmount.token,
    amount: slipBy(tokenAmount.amount, slippage, tokenAmount.token.decimals),
  };
}

export function slipAllBy(inputs: TokenAmount[], slippage: number): TokenAmount[] {
  return inputs.map(({ token, amount }) => ({
    token,
    amount: slipBy(amount, slippage, token.decimals),
  }));
}

/** Excess that arrives on dest when the full (unslipped) amount crosses the bridge, adjusted for proportional fees */
export function bridgeSlippageReturned(
  expectedAmount: BigNumber,
  slippedAmount: BigNumber,
  bridgeQuote: { toAmount: BigNumber; fromAmount: BigNumber },
  destToken: TokenEntity
): TokenAmount | undefined {
  if (expectedAmount.lte(slippedAmount)) return undefined;
  const excess = expectedAmount
    .minus(slippedAmount)
    .times(bridgeQuote.toAmount.dividedBy(bridgeQuote.fromAmount))
    .decimalPlaces(destToken.decimals, BigNumber.ROUND_FLOOR);
  if (excess.lte(BIG_ZERO)) return undefined;
  return { token: destToken, amount: excess };
}

export function mergeTokenAmounts(...tokenAmounts: TokenAmount[][]): TokenAmount[] {
  const amountsByToken = groupBy(
    tokenAmounts.flat(),
    tokenAmount => `${tokenAmount.token.chainId}-${tokenAmount.token.address}`
  );
  const outputs = Object.values(amountsByToken).map(amounts => ({
    token: amounts[0].token,
    amount: BigNumber.sum(...amounts.map(ta => ta.amount)),
  }));
  return outputs.filter(amount => !amount.amount.isZero());
}
