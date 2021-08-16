import { BigNumber } from 'bignumber.js';
import Loader from 'components/APYLoader';

export const formatApy = (apy, placeholder = <Loader />) => {
  if (!apy) return placeholder;

  apy *= 100;

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'Q', 'S', 'S'];
  const order = apy < 1 ? 0 : Math.floor(Math.log10(apy) / 3);
  if (order >= units.length - 1) return `🔥`;

  const num = apy / 1000 ** order;
  return `${num.toFixed(2)}${units[order]}%`;
};

export const formatUsd = (tvl, oraclePrice) => {
  // TODO: bignum?
  if (oraclePrice) {
    tvl *= oraclePrice;
  }

  const order = Math.floor(Math.log10(tvl) / 3);
  if (order < 0) {
    return '$0.00';
  }

  const units = ['', 'k', 'M', 'B', 'T'];
  const num = tvl / 1000 ** order;
  const prefix = '$';

  return prefix + num.toFixed(2) + units[order];
};

export const formatGlobalTvl = tvl => formatUsd(tvl, 1);

export const calcDaily = apy => {
  if (!apy) return <Loader />;

  const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;
  if (isNaN(g)) {
    return '- %';
  }

  return `${(g * 100).toFixed(2)}%`;
};

export const formatDecimals = (number, lgDecimals = 4, dustDecimals = 8) => {
  return number >= 10
    ? number.toFixed(lgDecimals)
    : number.isEqualTo(0)
    ? 0
    : number.toFixed(dustDecimals);
};

export function byDecimals(number, tokenDecimals = 18) {
  const decimals = new BigNumber(10).exponentiatedBy(tokenDecimals);
  return new BigNumber(number).dividedBy(decimals);
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
  const seconds = Math.floor((time / 1000) % 60)
    .toString()
    .padStart(2, '0');

  return `${day}day ${hours}:${minutes}:${seconds}`;
};

export const stripExtraDecimals = (f, decimals = 8) => {
  return f.indexOf('.') >= 0
    ? f.substr(0, f.indexOf('.')) + f.substr(f.indexOf('.'), decimals + 1)
    : f;
};

export function convertAmountToRawNumber(value, decimals = 18) {
  return new BigNumber(value)
    .times(new BigNumber('10').pow(decimals))
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .toString(10);
}
