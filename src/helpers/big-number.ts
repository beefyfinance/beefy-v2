import { BigNumber } from 'bignumber.js';

export type BigNumberish = BigNumber.Value;

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export function compound(
  rate: BigNumberish,
  principal: BigNumberish = BIG_ONE,
  periods: number = 365,
  times: number = 1
): BigNumber {
  return toBigNumber(principal)
    .times(BIG_ONE.plus(toBigNumber(rate).dividedBy(periods)).exponentiatedBy(periods * times))
    .minus(principal);
}

export function toBigNumber(input: BigNumberish): BigNumber {
  if (BigNumber.isBigNumber(input)) {
    return input;
  }

  return new BigNumber(input);
}

export function isBigNumber(value: any): value is BigNumber {
  return BigNumber.isBigNumber(value);
}

export function truncateBigNumber(value: BigNumber, places: number): BigNumber {
  if (value.isNaN() || !value.isFinite()) {
    return value;
  }

  return value.decimalPlaces(places);
}

export function toWei(value: BigNumber, decimals: number): BigNumber {
  return value.shiftedBy(decimals).decimalPlaces(0);
}

export function toWeiString(value: BigNumber, decimals: number): string {
  return toWei(value, decimals).toString(10);
}

export function fromWei(value: BigNumber, decimals: number): BigNumber {
  return value.shiftedBy(-decimals).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

export function fromWeiString(value: string, decimals: number): BigNumber {
  return fromWei(new BigNumber(value), decimals);
}
