import { format } from 'date-fns';
import { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';

export const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_all'];

// 2 HOURS - 1 DAY - 1 WEEK- 2 WEEK
export const X_DOMAIN_SECONDS = [7200, 86400, 604800, 604800 * 2];

export const formatXAxis = (tickItem: number, timebucket: TimeBucketType) => {
  if (timebucket === '1h_1d') {
    return format(tickItem, 'HH:mm');
  }
  return format(tickItem, 'dd/MM');
};

export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};
