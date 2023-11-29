import type { TokenAmount } from '../transact-types';
import { BigNumber } from 'bignumber.js';
import { toWei } from '../../../../../helpers/big-number';

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
