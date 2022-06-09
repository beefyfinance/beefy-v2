import { BigNumber } from 'bignumber.js';
import { TotalApy } from '../features/data/reducers/apy';
import { hexToNumber, isHexStrict } from 'web3-utils';
import { ReactNode } from 'react';
import { AllValuesAsString } from '../features/data/utils/types-utils';

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

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const formatApy = (apy, dp = 2, placeholder: any = '?') => {
  if (!apy) return placeholder;

  apy *= 100;

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'S'];
  const order = Math.floor(Math.log10(apy) / 3);
  const shouldShowUnits = order > 1;
  let unitToDisplay = '';
  if (order >= units.length - 1) return `🔥`;
  let num: BigNumber | number = new BigNumber(apy);
  if (shouldShowUnits) {
    num = apy / 1000 ** order;
    unitToDisplay = units[order];
  }

  return num < 999
    ? `${num.toFixed(dp)}${unitToDisplay}%`
    : apy.toLocaleString('en-US', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }) + '%';
};

export const formattedTotalApy = (
  totalApy: TotalApy,
  placeholder: ReactNode = '?'
): AllValuesAsString<TotalApy> => {
  return Object.fromEntries(
    Object.entries(totalApy).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value, 4, placeholder)
        : formatApy(value, 2, placeholder);
      return [key, formattedValue];
    })
  );
};

export const formatUsd = (tvl, oraclePrice = undefined) => {
  // TODO: bignum?
  if (oraclePrice) {
    tvl *= oraclePrice;
  }
  const order = Math.floor(Math.log10(tvl) / 3);

  const units = ['', 'k', 'M', 'B', 'T'];
  const shouldShowUnits = order > 1; // only use units if 1M+
  let unitToDisplay = '';
  let num: BigNumber | number = new BigNumber(tvl);

  if (shouldShowUnits) {
    num = tvl / 1000 ** order;
    unitToDisplay = units[order];
  }
  const prefix = '$';

  return num < 999
    ? prefix + num.toFixed(2) + unitToDisplay
    : tvl.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
};

export function getBigNumOrder(num: BigNumber): number {
  const nEstr = num.abs().decimalPlaces(0).toExponential();
  const parts = nEstr.split('e');
  const exp = parseInt(parts[1] || '0');
  return Math.floor(exp / 3);
}

export function formatBigUsd(value: BigNumber) {
  return '$' + formatBigNumber(value);
}

export function formatBigNumber(value: BigNumber) {
  value = value.decimalPlaces(2);

  if (value.isZero()) {
    return '0';
  }
  const order = getBigNumOrder(value);
  if (value.abs().gte(100)) {
    value = value.decimalPlaces(0);
  }
  if (order < 2 && value.abs().gte(100)) {
    return value.toNumber().toLocaleString('en-US', {
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

const stripTrailingZeros = str => {
  return str.replace(/(\.[0-9]*?)(0+$)/, '$1').replace(/\.$/, '');
};

export function byDecimals(number, tokenDecimals = 18) {
  const decimals = new BigNumber(10).exponentiatedBy(tokenDecimals);
  return new BigNumber(number).dividedBy(decimals).decimalPlaces(tokenDecimals);
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
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .toString(10);
}

export function maybeHexToNumber(input: any): number {
  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    return isHexStrict(input) ? hexToNumber(input) : Number(input);
  }

  throw new Error(`${typeof input} "${input}" is not valid hex or number.`);
}

export function formatAddressShort(addr: string): string {
  return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
}
