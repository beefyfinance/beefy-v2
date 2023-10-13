import { BigNumber } from 'bignumber.js';
import type { TotalApy } from '../features/data/reducers/apy';
import { toNumber } from 'web3-utils';
import type { ReactNode } from 'react';
import type { AllValuesAsString } from '../features/data/utils/types-utils';
import { BIG_ONE, BIG_ZERO, isBigNumber, toBigNumber } from './big-number';
import type { SerializedError } from '@reduxjs/toolkit';
import { isString, padStart } from 'lodash-es';

export function formatBigNumberSignificant(num: BigNumber, digits = 6) {
  const number = num.toFormat({
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 0,
    secondaryGroupSize: 0,
  });
  if (number.length <= digits + 1) {
    return number;
  }
  const [wholes, decimals] = number.split('.');
  if (wholes.length >= digits) {
    return wholes;
  }
  const pattern = new RegExp(`^[0]*[0-9]{0,${digits - (wholes === '0' ? 0 : wholes.length)}}`);
  return `${wholes}.${decimals.match(pattern)[0]}`;
}

/**
 * Formats a number to output as a percent% string
 * @param percent as decimal e.g. 0.01 to represent 1%
 * @param dp
 * @param placeholder
 */
export function formatPercent<T = string>(
  percent: number | BigNumber | null | undefined,
  dp = 2,
  placeholder: T | string = '?'
): T | string {
  if (!percent && percent !== 0) return placeholder;

  if (percent === 0) {
    return '0%';
  }

  // Convert to number
  const numberPercent: number = (isBigNumber(percent) ? percent.toNumber() : percent) * 100;

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'S'];
  const order = Math.floor(Math.log10(numberPercent) / 3);

  // Show fire symbol if very large %
  if (order >= units.length - 1) return `🔥`;

  // Magnitude to display
  let unitToDisplay = '';
  let num: number = numberPercent;
  if (order > 1) {
    num = numberPercent / 1000 ** order;
    unitToDisplay = units[order];
  }

  // Format output
  return num < 999
    ? `${num.toFixed(dp)}${unitToDisplay}%`
    : numberPercent.toLocaleString(navigator.language, {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }) + '%';
}

/**
 * @param percent 0..1
 * @param maxPlaces
 * @param minPlaces
 * @param formatZero
 */
export function formatSmallPercent(
  percent: number,
  maxPlaces: number = 2,
  minPlaces: number = 0,
  formatZero: boolean = false
): string {
  return !formatZero && percent === 0
    ? '0%'
    : (percent * 100).toLocaleString(navigator.language, {
        maximumFractionDigits: maxPlaces,
        minimumFractionDigits: minPlaces,
      }) + '%';
}

export const formattedTotalApy = (
  totalApy: TotalApy,
  placeholder: ReactNode = '?'
): AllValuesAsString<TotalApy> => {
  return Object.fromEntries(
    Object.entries(totalApy).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatPercent(value, 4, placeholder)
        : formatPercent(value, 2, placeholder);
      return [key, formattedValue];
    })
  );
};

/**
 * Formats: 123 -> $123, 1234 -> $1.23k, 1234567 -> $1.23M etc
 * Supports `BigNumber`, but only for values than can fit in normal js `number`
 */
export function formatUsd(
  input: number | BigNumber,
  oraclePrice: number | BigNumber | undefined = undefined
): string {
  const value: number = oraclePrice
    ? toBigNumber(input).times(oraclePrice).toNumber()
    : isBigNumber(input)
    ? input.toNumber()
    : input;

  if (value === 0) {
    return '$0';
  }

  const order = Math.floor(Math.log10(value) / 3);
  const units = ['', 'k', 'M', 'B', 'T'];
  const shouldShowUnits = order > 1; // only use units if 1M+
  let unitToDisplay = '';
  let num: number = value;

  if (shouldShowUnits) {
    num = value / 1000 ** order;
    unitToDisplay = units[order];
  }
  const prefix = '$';

  return num < 999
    ? prefix + num.toFixed(2) + unitToDisplay
    : value.toLocaleString(navigator.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
}

export function getBigNumOrder(num: BigNumber): number {
  const nEstr = num.abs().decimalPlaces(0, BigNumber.ROUND_FLOOR).toExponential();
  const parts = nEstr.split('e');
  const exp = parseInt(parts[1] || '0');
  return Math.floor(exp / 3);
}

export function formatBigUsd(value: BigNumber) {
  if (value.lt(BIG_ZERO)) {
    return '-$' + formatBigNumber(value.negated());
  }

  return '$' + formatBigNumber(value);
}

export function formatBigNumber(value: BigNumber) {
  value = value.decimalPlaces(2, BigNumber.ROUND_FLOOR);

  if (value.isZero()) {
    return '0';
  }
  const order = getBigNumOrder(value);
  if (value.abs().gte(100)) {
    value = value.decimalPlaces(0, BigNumber.ROUND_FLOOR);
  }
  if (order < 2 && value.abs().gte(100)) {
    return value.toNumber().toLocaleString(navigator.language, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
  const units = ['', 'k', 'M', 'B', 'T'];

  return value.shiftedBy(-order * 3).toFixed(2) + units[order];
}

export function formatBigDecimals(value: BigNumber, maxPlaces: number = 8, strip = true) {
  if (value.isZero() && strip) {
    return '0';
  }

  const fixed = value.toFixed(maxPlaces);
  return strip ? stripTrailingZeros(fixed) : fixed;
}

export function formatFullBigNumber(
  value: BigNumber,
  maxDp: number,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_FLOOR
) {
  return stripTrailingZeros(
    value.toFormat(maxDp, roundMode, {
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

/**
 * Formats only to enough decimals to show $0.01 worth
 * @param value token amount to format
 * @param decimals number of decimals the token has
 * @param price price in USD per 1 token
 * @param extraPlaces number of decimals more than needed to show $0.01
 * @param minPlaces minimum number of decimals to show
 * @param roundMode
 */
export function formatSignificantBigNumber(
  value: BigNumber,
  decimals: number,
  price: BigNumber,
  extraPlaces: number = 0,
  minPlaces: number = 2,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_FLOOR
) {
  const tokensPerCent = BIG_ONE.dividedBy(price.multipliedBy(100));
  const sigPlaces = getFirstNonZeroDecimal(tokensPerCent, decimals) + extraPlaces;
  const places = Math.max(Math.min(sigPlaces, decimals), minPlaces);

  return stripTrailingZeros(
    value.toFormat(places, roundMode, {
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

function getFirstNonZeroDecimal(value: BigNumber, max: number): number {
  let position = 0;

  if (value.isEqualTo(BIG_ZERO) || value.gte(BIG_ONE)) {
    return 0;
  }

  while (value.lt(BIG_ONE) && position < max) {
    value = value.multipliedBy(10);
    ++position;
  }

  return position;
}

export const stripTrailingZeros = str => {
  return str.replace(/(\.[0-9]*?)(0+$)/, '$1').replace(/\.$/, '');
};

export function byDecimals(number, tokenDecimals = 18) {
  const decimals = new BigNumber(10).exponentiatedBy(tokenDecimals);
  return new BigNumber(number)
    .dividedBy(decimals)
    .decimalPlaces(tokenDecimals, BigNumber.ROUND_FLOOR);
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

export function errorToString(error: SerializedError | string) {
  return isString(error)
    ? error
    : `${error?.message || error?.name || error?.code || String(error)}`;
}

export function zeroPad(value: number | undefined): string {
  return padStart((value || 0).toString(), 2, '0');
}
