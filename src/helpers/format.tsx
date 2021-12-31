import { BigNumber } from 'bignumber.js';
import { ApyStatLoader } from '../components/ApyStatLoader';

(BigNumber.prototype as any).significant = function (digits) {
  const number = this.toFormat({
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
};

export const BIG_ZERO = new BigNumber(0);

export const formatApy = (apy, dp = 2, placeholder: any = <ApyStatLoader />) => {
  if (!apy) return placeholder;

  apy *= 100;

  const units = ['', 'k', 'M', 'B', 'T', 'Q', 'Q', 'S', 'S'];
  const order = apy < 1 ? 0 : Math.floor(Math.log10(apy) / 3);
  if (order >= units.length - 1) return `🔥`;

  const num = apy / 1000 ** order;
  return `${num.toFixed(dp)}${units[order]}%`;
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

export const formatGlobalTvl = tvl => formatUsd(tvl, 1);

export const calcDaily = apy => {
  if (!apy) return <ApyStatLoader />;

  const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;
  if (isNaN(g)) {
    return '- %';
  }

  return `${(g * 100).toFixed(2)}%`;
};

export const stripTrailingZeros = str => {
  return str.replace(/(\.[0-9]*?)(0+$)/, '$1').replace(/\.$/, '');
};

export const formatDecimals = (number, maxPlaces = 8) => {
  if (new BigNumber(number).isZero()) {
    return '0';
  }

  const places = Math.min(maxPlaces, number >= 10 ? 4 : 8);
  return stripTrailingZeros(new BigNumber(number).toFixed(places));
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
