import { format } from 'date-fns';
import { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';

export const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_all'];

export const formatXAxis = (tickItem: number, timebucket: TimeBucketType) => {
  const date = new Date(tickItem);
  if (timebucket === '1h_1d') {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};
