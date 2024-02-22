import type { TokenAmount } from '../transact-types';
import { BigNumber } from 'bignumber.js';
import { toWei } from '../../../../../helpers/big-number';
import { groupBy } from 'lodash-es';

export function tokenAmountToWei(tokenAmount: TokenAmount): BigNumber {
  return toWei(tokenAmount.amount, tokenAmount.token.decimals);
}

export function slipBy(amount: BigNumber, slippage: number, decimals: number): BigNumber {
  return amount.multipliedBy(1 - slippage).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

export function slipAllBy(inputs: TokenAmount[], slippage: number): TokenAmount[] {
  return inputs.map(({ token, amount }) => ({
    token,
    amount: slipBy(amount, slippage, token.decimals),
  }));
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
