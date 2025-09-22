import BigNumber from 'bignumber.js';
import { mapValues, padStart } from 'lodash-es';
import type { ReactNode } from 'react';
import { hexToBigInt } from 'viem';
import type { AvgApy, AvgApyPeriod, TotalApy } from '../features/data/reducers/apy-types.ts';
import type { AllValuesAs } from '../features/data/utils/types-utils.ts';
import { type BigNumberish, toBigNumber } from './big-number.ts';
import { strictEntries } from './object.ts';

export enum Scale {
  None = 0,
  Thousand = 3,
  Million = 6,
  Billion = 9,
  Trillion = 12,
  Quadrillion = 15,
  Quintillion = 18,
  Sextillion = 21,
  Septillion = 24,
  Octillion = 27,
  Nonillion = 30,
}

const maxScale = Scale.Nonillion;

// Scale Suffixes (Short Scale, i.e. 1000 × 1000^n, for n = 1... from million+)
const scaleSuffixes: Record<
  Scale,
  {
    short: string;
    long: string;
    e: number;
  }
> = {
  [Scale.None]: { short: '', long: '', e: 0 },
  [Scale.Thousand]: { short: 'k', long: 'thousand', e: 3 },
  [Scale.Million]: { short: 'M', long: 'million', e: 6 },
  [Scale.Billion]: { short: 'B', long: 'billion', e: 9 },
  [Scale.Trillion]: { short: 'T', long: 'trillion', e: 12 },
  [Scale.Quadrillion]: { short: 'Qa', long: 'quadrillion', e: 15 },
  [Scale.Quintillion]: { short: 'Qi', long: 'quintillion', e: 18 },
  [Scale.Sextillion]: { short: 'Sx', long: 'sextillion', e: 21 },
  [Scale.Septillion]: { short: 'Sp', long: 'septillion', e: 24 },
  [Scale.Octillion]: { short: 'O', long: 'octillion', e: 27 },
  [Scale.Nonillion]: { short: 'N', long: 'nonillion', e: 30 },
};

function isScale(value: Scale): value is Scale {
  return value in Scale;
}

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
    digits = decimals + 1;
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

  // Handle small numbers with leading decimal zeros using subscript notation
  if (value.isLessThan(1) && decimalDigits > 0) {
    return condenseDecimalZeros(formatGrouped(value, decimals), decimalDigits);
  }

  // For other cases, use the significant decimals calculated
  return formatGrouped(value, decimalDigits);
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

  const { value, unit, overMax } = toScale(ratio.shiftedBy(2), Scale.Million);

  if (overMax) {
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

  return percent.isZero() ? '0%' : (
      percent.toFormat(decimals, roundMode, {
        prefix: '',
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: '',
        fractionGroupSize: 0,
        suffix: '%',
      })
    );
}

interface FormatLargeNumberOptions {
  /** from what order of magnitude should we start formatting to scale */
  minScale: Scale;
  /** under what value should decimals be output */
  decimalsUnder: BigNumberish;
  /** maximum decimal places to output */
  decimals: number;
  /** minimum decimal places to output */
  decimalsMin: number;
  /** add minimum decimals even when value is 0 */
  decimalsMinAppliesToZero: boolean;
  /** show if number is so large we run out of scales */
  veryLargePlaceholder?: string;
}

const defaultFormatLargeNumberOptions: FormatLargeNumberOptions = {
  minScale: Scale.Million,
  decimals: 2,
  decimalsUnder: 1000,
  decimalsMin: 0,
  decimalsMinAppliesToZero: false,
  veryLargePlaceholder: '🔥',
};

/**
 * Defaults: 123 -> 123, 1234 -> 1,234, 1234567 -> 1.23M etc
 */
function formatLargeNumber(
  input: BigNumberish,
  options?: Partial<FormatLargeNumberOptions>
): string {
  const { minScale, decimalsUnder, decimals, decimalsMin, decimalsMinAppliesToZero } =
    options ? { ...defaultFormatLargeNumberOptions, ...options } : defaultFormatLargeNumberOptions;

  const inputValue = toBigNumber(input);

  if (inputValue.isZero()) {
    return decimalsMinAppliesToZero && decimalsMin ? ensureMinDecimals('0', decimalsMin) : '0';
  }

  if (!inputValue.isFinite() && options?.veryLargePlaceholder) {
    return options.veryLargePlaceholder;
  }

  const { value, unit, overMax } = toScale(inputValue, minScale);
  if (overMax && options?.veryLargePlaceholder) {
    return options.veryLargePlaceholder;
  }

  const withDecimals = value.absoluteValue().lt(decimalsUnder);
  const valueGrouped = formatGrouped(value, withDecimals ? decimals : 0);
  const valueFormatted = withDecimals ? ensureMinDecimals(valueGrouped, decimalsMin) : valueGrouped;
  return `${valueFormatted}${unit}`;
}

export function formatUsd(input: BigNumberish, decimals: number = 2): string {
  const value = toBigNumber(input);
  const prefix = value.isNegative() ? '-$' : '$';
  return `${prefix}${formatGrouped(value.absoluteValue(), decimals)}`;
}

/** @see defaultFormatLargeUsdOptions */
export type FormatLargeUsdOptions = FormatLargeNumberOptions & {
  zeroPrefix: string;
  negativePrefix: string;
  positivePrefix: string;
};

const defaultFormatLargeUsdOptions: FormatLargeUsdOptions = {
  ...defaultFormatLargeNumberOptions,
  decimalsMin: 2,
  zeroPrefix: '$',
  negativePrefix: '-$',
  positivePrefix: '$',
};

/**
 * Formats: 123 -> $123, 1234 -> $1234, 1234567 -> $1.23M etc
 * @param input
 * @param options
 */
export function formatLargeUsd(
  input: BigNumberish,
  options?: Partial<FormatLargeUsdOptions>
): string {
  const { zeroPrefix, positivePrefix, negativePrefix, ...largeOptions } =
    options ? { ...defaultFormatLargeUsdOptions, ...options } : defaultFormatLargeUsdOptions;
  const value = toBigNumber(input);

  const prefix =
    value.isZero() ? zeroPrefix
    : value.isNegative() ? negativePrefix
    : positivePrefix;
  return `${prefix}${formatLargeNumber(value.absoluteValue(), largeOptions)}`;
}

export type FormattedTotalApy<T = string> = {
  [K in keyof TotalApy]: TotalApy[K] extends T ? TotalApy[K] : T;
};

export function formatTotalApy(totalApy: TotalApy, placeholder?: string): FormattedTotalApy;
export function formatTotalApy(
  totalApy: TotalApy,
  placeholder?: ReactNode
): FormattedTotalApy<ReactNode>;
/**
 * Formats a TotalApy object to a string for display
 */
export function formatTotalApy(
  totalApy: TotalApy,
  placeholder: ReactNode = '?'
): AllValuesAs<TotalApy, string | ReactNode> {
  return Object.fromEntries(
    strictEntries(totalApy).map(([key, value]) => {
      const formattedValue =
        key === 'totalType' ? value
        : key.toLowerCase().includes('daily') ? formatLargePercent(value, 4, placeholder)
        : formatLargePercent(value, 2, placeholder);
      return [key, formattedValue];
    })
  ) as AllValuesAs<TotalApy, string | ReactNode>; // required keys in input so should exist in output
}

export type FormattedAvgApy = AvgApy & {
  periods: Record<number, AvgApyPeriod & { formatted?: string }>;
};

export function formatAvgApy(avgApy: AvgApy): FormattedAvgApy {
  return {
    ...avgApy,
    periods: mapValues(avgApy.periods, item => ({
      ...item,
      formatted: item.partial ? formatLargePercent(item.value, 2) : undefined,
    })),
  };
}

export function convertAmountToRawNumber(value: BigNumber.Value, decimals = 18) {
  return new BigNumber(value)
    .shiftedBy(decimals)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR)
    .toString(10);
}

export function maybeHexToNumber(input: unknown): number {
  if (typeof input === 'number') {
    return input;
  }
  if (typeof input === 'string') {
    const maybeNumber = hexToBigInt(input as `0x${string}`, { signed: false });
    const number = Number(maybeNumber);
    if (BigInt(number) === maybeNumber) {
      return number;
    }

    throw new Error(`${typeof input} "${input}" is too large to be a number.`);
  }

  throw new Error(`${typeof input} "${input}" is not valid hex or number.`);
}

export function formatAddressShort(
  addr: string,
  prefixLen: number = 4,
  postfixLen: number = 4
): string {
  return addr.substring(0, prefixLen) + '...' + addr.substring(addr.length - postfixLen);
}

export function formatDomain(domain: string, length: number = 16): string {
  if (domain.length > length) {
    return domain.substring(0, 6) + '...' + domain.substring(domain.length - 3);
  }
  return domain;
}

export function errorToString(error: unknown, fallbackMessage: string = 'Unknown error'): string {
  if (error === undefined || error === null) {
    return fallbackMessage;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const maybeString =
      ('message' in error && error.message) ||
      ('name' in error && error.name) ||
      ('code' in error && error.code) ||
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      String(error);

    return maybeString && typeof maybeString === 'string' ? maybeString : fallbackMessage;
  }

  return fallbackMessage;
}

function ensureMinDecimals(value: string, decimals: number): string {
  if (decimals === 0) {
    return value;
  }
  const ptIndex = value.lastIndexOf('.');
  if (ptIndex === -1) {
    return `${value}.${'0'.repeat(decimals)}`;
  }
  if (ptIndex + decimals < value.length) {
    return value;
  }

  return `${value.slice(0, ptIndex + 1)}${value.slice(ptIndex + 1).padEnd(decimals, '0')}`;
}

export function zeroPad(value: number | undefined, length: number): string {
  return padStart((value || 0).toString(), length, '0');
}

function toScale(value: BigNumber, minScale: Scale = Scale.Thousand) {
  if (value.e === null) {
    return { value: value, unit: '', overMax: false };
  }

  const rawScale = Math.trunc(value.e / 3) * 3;
  if (rawScale < minScale.valueOf() || rawScale < 0) {
    return { value: value, unit: '', overMax: false };
  }

  const overMax = rawScale > maxScale.valueOf();
  const scale = overMax || !isScale(rawScale) ? maxScale : rawScale;
  const suffix = overMax ? scaleSuffixes[maxScale] : scaleSuffixes[scale];
  const newValue = value.shiftedBy(-suffix.e);
  return { value: newValue, unit: suffix.short, overMax };
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

export function formatPositiveOrNegative(number: BigNumber, value: string, symbol = ''): string {
  if (number.isNegative()) {
    return `-${value.replace('-', '')} ${symbol}`;
  } else {
    return `+${value} ${symbol}`;
  }
}

export function formatNumber(value: number, maxDecimals: number): string {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}
