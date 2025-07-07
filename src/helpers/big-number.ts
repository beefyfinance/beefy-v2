import BigNumber from 'bignumber.js';
import { mapValues } from 'lodash-es';
import type { TokenAmount } from '../features/data/apis/transact/transact-types.ts';
import type { TokenEntity } from '../features/data/entities/token.ts';

export type BigNumberish = BigNumber.Value;

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);
export const BIG_MAX_UINT256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);
export const BIG_MAX_INT256 = new BigNumber(
  '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);
export const BIG_MIN_INT256 = new BigNumber(
  '-0x8000000000000000000000000000000000000000000000000000000000000000'
);
export const Q192 = new BigNumber(2).pow(192);

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

export function isBigNumber(value: unknown): value is BigNumber {
  return BigNumber.isBigNumber(value);
}

function bigNumberToString(value: BigNumber, typeName: string): string {
  const dp = value.decimalPlaces();
  if (dp === null || dp > 0) {
    throw new Error(`${typeName} should be an integer`);
  }
  return value.toString(10);
}

export function bigNumberToUint256String(value: BigNumber): string {
  if (value.isNegative()) {
    throw new Error('uint256 should be positive');
  }
  if (value.isGreaterThan(BIG_MAX_UINT256)) {
    throw new Error('uint256 should be less than 2^256');
  }
  return bigNumberToString(value, 'uint256');
}

export function bigNumberToInt256String(value: BigNumber): string {
  if (value.isGreaterThan(BIG_MAX_INT256) || value.isLessThan(BIG_MIN_INT256)) {
    throw new Error('int256 should be between -2^255 and 2^255-1');
  }
  return bigNumberToString(value, 'int256');
}

export function bigNumberToBigInt(value: BigNumber): bigint {
  // Ensure the BigNumber is an integer.
  const dp = value.decimalPlaces();
  if (dp === null || dp > 0) {
    throw new Error('BigNumber must be an integer to convert to bigint');
  }

  // Convert the BigNumber to a string and then to a native bigint.
  return BigInt(value.toString(10));
}

export function truncateBigNumber(value: BigNumber, places: number): BigNumber {
  if (value.isNaN() || !value.isFinite()) {
    return value;
  }

  return value.decimalPlaces(places, BigNumber.ROUND_FLOOR);
}

export function averageBigNumbers(values: BigNumber[]): BigNumber {
  if (values.length === 0) {
    return BIG_ZERO;
  }
  return values.reduce((sum, value) => sum.plus(value), BIG_ZERO).dividedBy(values.length);
}

export function toWei(value: BigNumber, decimals: number): BigNumber {
  return value.shiftedBy(decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
}

export function toWeiBigInt(value: BigNumber, decimals: number): bigint {
  return BigInt(value.shiftedBy(decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR).toString(10));
}

export function toWeiFromString(value: string, decimals: number): BigNumber {
  return toWei(new BigNumber(value), decimals);
}

export function toWeiFromTokenAmount(tokenAmount: TokenAmount): BigNumber {
  return toWei(tokenAmount.amount, tokenAmount.token.decimals);
}

export function toWeiString(value: BigNumber, decimals: number): string {
  return toWei(value, decimals).toString(10);
}

export function fromWei(value: BigNumber.Value, decimals: number): BigNumber {
  return (isBigNumber(value) ? value : new BigNumber(value))
    .shiftedBy(-decimals)
    .decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

export function fromWeiToTokenAmount(value: BigNumber.Value, token: TokenEntity): TokenAmount {
  return {
    token,
    amount: fromWei(value, token.decimals),
  };
}

/**
 * Recursively maps over an object and replaces any BigNumber object with string value
 * e.g. "BN(123.567)"
 * Use only for debugging
 */
export function bigNumberToStringDeep(input: unknown): unknown {
  if (input && typeof input === 'object') {
    if (input instanceof Date) {
      return input;
    }

    if (BigNumber.isBigNumber(input)) {
      return `BN(${input.toString(10)})`;
    }

    if (Array.isArray(input)) {
      return input.map(bigNumberToStringDeep);
    }

    return mapValues(input, bigNumberToStringDeep);
  }

  return input;
}

export function isFiniteBigNumber(value: unknown): value is BigNumber {
  return value !== null && isBigNumber(value) && !value.isNaN() && value.isFinite();
}

export function compareBigNumber(a: BigNumber, b: BigNumber): number {
  const result = a.comparedTo(b);
  return result === null ? 0 : result;
}

export function orderByBigNumber<T>(
  items: T[],
  extractor: (item: T) => BigNumber,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort(
    direction === 'asc' ?
      (a, b) => compareBigNumber(extractor(a), extractor(b))
    : (a, b) => compareBigNumber(extractor(b), extractor(a))
  );
}

/** 0.1 = 10% */
export function percentDifference(a: BigNumber, b: BigNumber): BigNumber {
  return a.minus(b).abs().dividedBy(a.plus(b).dividedBy(2));
}

/** 0.1 = 10% */
export function isEqualWithinPercent(
  a: BigNumber,
  b: BigNumber,
  percent: BigNumber.Value
): boolean {
  const diff = percentDifference(a, b);
  return diff.isLessThanOrEqualTo(percent);
}
