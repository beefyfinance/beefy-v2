import { format } from 'date-fns';
import { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';
import { formatUsd } from '../../../../../../helpers/format';

export const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_all'];

export const formatXAxis = (tickItem: number, timebucket: TimeBucketType) => {
  const date = new Date(tickItem);
  if (timebucket === '1h_1d') {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};

export function formatUnderlyingTick(value: number, minMax: [number, number]) {
  const [, max] = minMax;

  if (max >= 0.001) {
    const decimals = max > 999 ? 0 : 3;

    return value.toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  }

  // if max is less than 0.001, we move to exponential notation
  return value.toExponential(2);
}

export function formatUsdTick(value: number) {
  return formatUsd(value);
}
