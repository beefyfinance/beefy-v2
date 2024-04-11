import { BigNumber } from 'bignumber.js';
import type { TotalApy } from '../features/data/reducers/apy';
import { toNumber } from 'web3-utils';
import type { ReactNode } from 'react';
import type { AllValuesAs } from '../features/data/utils/types-utils';
import { type BigNumberish, toBigNumber } from './big-number';
import type { SerializedError } from '@reduxjs/toolkit';
import { isString, padStart } from 'lodash-es';
import { strictEntries } from './object';

/**
 * Format a (BigNumber|number) to a string of {decimals} decimal places
 * Example use: input fields
 * @param value number or BigNumber
 * @param decimals how many decimal places to output (how many decimals the token has)
 */
export function formatTokenInput(value: BigNumberish, decimals: number): string {
  return toDecimalPlaces(value, decimals).toString(10);
}

/**
 * Format a (BigNumber|number) to a string for display
 * Strips trailing decimal 0s
 * @param input number or BigNumber
 * @param decimals
 */
export function formatTokenDisplay(input: BigNumberish, decimals: number) {
  return formatGrouped(toBigNumber(input), decimals);
}

/**
 * Format a (BigNumber|number) to a shortened string for display
 * Attempts to only show {digits} overall digits (will show more if whole part is longer)
 * Condenses leading decimal zeros to subscript notation
 * @param input number or BigNumber
 * @param decimals how many decimals the token has
 * @param digits how many overall digits to display (default: 8)
 */
export function formatTokenDisplayCondensed(
  input: BigNumberish,
  decimals: number,
  digits: number = 8
): string {
  const value = toDecimalPlaces(input, decimals);

  if (value.isZero()) {
    return '0';
  }

  // Default/Clamp: all decimals
  if (digits === undefined || digits > decimals) {
    digits = decimals;
  }

  // Work out how many digits we have for whole and fraction
  const wholeDigits = value
    .absoluteValue()
    .decimalPlaces(0, BigNumber.ROUND_FLOOR)
    .toString(10).length;
  const decimalDigits = digits - wholeDigits;

  // Whole number only
  if (decimalDigits <= 0) {
    return formatGrouped(value, 0);
  }

  return condenseDecimalZeros(formatGrouped(value, decimals), decimalDigits);
}

/**
 * Formats a number to output as a percent% string
 * @param input as decimal e.g. 0.01 to represent 1%
 * @param decimals decimal places
 * @param missingPlaceholder to show if percent is null or undefined
 * @param veryLargePlaceholder to show if percent is very large
 */
export function formatLargePercent<T = string>(
  input: BigNumberish | null | undefined,
  decimals = 2,
  missingPlaceholder: T | string = '?',
  veryLargePlaceholder: T | string = '🔥'
): T | string {
  const minOrder = 2; // show units for 1m+
  const decimalsUnder = 1000; // show 2 decimal places values < 1000
  if (input === null || input === undefined) {
    return missingPlaceholder;
  }

  const ratio = toBigNumber(input);
  if (ratio.isNaN()) {
    return missingPlaceholder;
  }

  if (ratio.isZero()) {
    return '0%';
  }

  if (!ratio.isFinite()) {
    return ratio.isPositive() ? veryLargePlaceholder : missingPlaceholder;
  }

  const { value, unit } = toMagnitude(ratio.shiftedBy(2), minOrder);

  if (unit === undefined) {
    return veryLargePlaceholder;
  }

  return `${formatGrouped(value, value.lt(decimalsUnder) ? decimals : 0)}${unit}%`;
}

/**
 * @param input as decimal e.g. 0.01 to represent 1%
 * @param decimals decimal places
 * @param roundMode
 */
export function formatPercent(
  input: BigNumberish,
  decimals: number = 2,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_FLOOR
): string {
  const percent = toBigNumber(input).shiftedBy(2);

  return percent.isZero()
    ? '0%'
    : percent.toFormat(decimals, roundMode, {
        prefix: '',
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: '',
        fractionGroupSize: 0,
        suffix: '%',
      });
}

export function formatUsd(input: BigNumberish, decimals: number = 2): string {
  const value = toBigNumber(input);
  const prefix = value.isNegative() ? '-$' : '$';
  return `${prefix}${formatGrouped(value.absoluteValue(), decimals)}`;
}

/**
 * Formats: 123 -> $123, 1234 -> $1234, 1234567 -> $1.23M etc
 * @param input
 * @param decimals decimal places to display if formatted value <  decimalsUnder
 * @param minOrder order of magnitude to start showing units (1=k, 2=M, 3=B etc.)
 * @param decimalsUnder formatted value under which to show decimals
 */
export function formatLargeUsd(
  input: BigNumberish,
  decimals: number = 2,
  minOrder: number = 2,
  decimalsUnder: BigNumberish = 1000
): string {
  const value = toBigNumber(input);

  if (value.isZero()) {
    return '$0';
  }

  const prefix = value.isNegative() ? '-$' : '$';
  return `${prefix}${formatLargeNumber(value.absoluteValue(), decimals, minOrder, decimalsUnder)}`;
}

export function formatTotalApy(
  totalApy: TotalApy,
  placeholder?: string
): AllValuesAs<TotalApy, string>;
export function formatTotalApy(
  totalApy: TotalApy,
  placeholder?: ReactNode
): AllValuesAs<TotalApy, ReactNode>;
/**
 * Formats a TotalApy object to a string for display
 */
export function formatTotalApy(
  totalApy: TotalApy,
  placeholder: ReactNode = '?'
): AllValuesAs<TotalApy, string | ReactNode> {
  return Object.fromEntries(
    strictEntries(totalApy).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatLargePercent(value, 4, placeholder)
        : formatLargePercent(value, 2, placeholder);
      return [key, formattedValue];
    })
  ) as AllValuesAs<TotalApy, string | ReactNode>; // required keys in input so should exist in output
}

export const formatCountdown = deadline => {
  const time = deadline - new Date().getTime();

  const day = Math.floor(time / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(2, '0');
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((time / (1000 * 60)) % 60)
    .toString()
    .padStart(2, '0');
  // const seconds = Math.floor((time / 1000) % 60)
  //   .toString()
  //   .padStart(2, '0');

  return `${day}d ${hours}h ${minutes}m`;
};

export function convertAmountToRawNumber(value, decimals = 18) {
  return new BigNumber(value)
    .shiftedBy(decimals)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR)
    .toString(10);
}

export function maybeHexToNumber(input: number | string | unknown): number {
  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    const maybeNumber = toNumber(input, false);
    if (typeof maybeNumber === 'number') {
      return maybeNumber;
    }

    throw new Error(`${typeof input} "${input}" is too large to be a number.`);
  }

  throw new Error(`${typeof input} "${input}" is not valid hex or number.`);
}

export function formatAddressShort(addr: string): string {
  return addr.substring(0, 4) + '...' + addr.substring(addr.length - 4);
}

export function formatDomain(domain: string, length: number = 16): string {
  if (domain.length > length) {
    return domain.substring(0, 6) + '...' + domain.substring(domain.length - 3);
  }
  return domain;
}

export function errorToString(
  error: SerializedError | string | undefined | null,
  fallbackMessage: string = 'Unknown error'
) {
  if (error === undefined || error === null) {
    return fallbackMessage;
  }

  return isString(error)
    ? error
    : `${error?.message || error?.name || error?.code || String(error) || fallbackMessage}`;
}

/**
 * Defaults: 123 -> 123, 1234 -> 1,234, 1234567 -> 1.23M etc
 */
function formatLargeNumber(
  input: BigNumberish,
  decimals: number = 2,
  minOrder: number = 2,
  decimalsUnder: BigNumberish = 1000
): string {
  const inputValue = toBigNumber(input);

  if (inputValue.isZero()) {
    return '0';
  }

  const { value, unit } = toMagnitude(inputValue, minOrder);

  return `${formatGrouped(value, value.absoluteValue().lt(decimalsUnder) ? decimals : 0)}${unit}`;
}

export function zeroPad(value: number | undefined, length: number): string {
  return padStart((value || 0).toString(), length, '0');
}

function toMagnitude(value: BigNumber, minOrder: number = 1) {
  if (value.e === null) {
    return { value: value, unit: '' };
  }

  const order = Math.floor(value.e / 3);
  if (order < minOrder || order < 0) {
    return { value: value, unit: '' };
  }

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'S'];
  const newValue = value.shiftedBy(-order * 3);
  return { value: newValue, unit: units[order] };
}

function toSubString(input: string) {
  const subchars = '₀₁₂₃₄₅₆₇₈₉';
  return input.replace(/[0-9]/g, m => subchars[+m]);
}

function condenseDecimalZeros(value: string, decimalDigits: number) {
  // Get whole and fraction part
  const [whole, decimal] = value.split('.');

  // No decimal part
  if (!decimal || !decimal.length) {
    return whole;
  }

  // Condense zeros
  let subLength = 0;
  const formattedDecimal = decimal.replace(/0*$/, '').replace(/^0{3,}/, match => {
    const removed = match.length.toString();
    const sub = toSubString(removed);
    subLength = sub.length;
    return `0${sub}`;
  });

  return `${whole}.${formattedDecimal.slice(0, decimalDigits + subLength).replace(/0*$/, '')}`;
}

function toDecimalPlaces(value: BigNumberish, decimals: number): BigNumber {
  return toBigNumber(value).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

function formatGrouped(value: BigNumber, decimals: number): string {
  return stripTrailingZeros(
    value.toFormat(decimals, BigNumber.ROUND_FLOOR, {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: '.',
      fractionGroupSize: 0,
      suffix: '',
    })
  );
}

function stripTrailingZeros(str: string) {
  return str.replace(/(\.[0-9]*?)(0+$)/, '$1').replace(/\.$/, '');
}
