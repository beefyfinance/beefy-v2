import { format } from 'date-fns';
import type { TimeBucketType } from '../features/data/apis/analytics/analytics-types';
import { formatLargeUsd } from './format';
import type { ApiTimeBucket } from '../features/data/apis/beefy/beefy-data-api-types';
import type { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';

export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};

export const getXInterval = (dataLenght: number, xsDown: boolean) => {
  const interval = xsDown ? 8 : 10;
  const elementsPerResult = Math.ceil(dataLenght / interval);
  const numResults = Math.ceil(dataLenght / elementsPerResult);
  return Math.ceil(dataLenght / numResults);
};

/** only buckets both databarn and data apis support */
export type GraphBucket = TimeBucketType & ApiTimeBucket;

export const GRAPH_TIME_BUCKETS = [
  '1h_1d',
  '1h_1w',
  '1d_1M',
  '1d_all',
] as const satisfies GraphBucket[];

export const formatDateTimeTick = (tickItem: number, timebucket: GraphBucket) => {
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
  return formatLargeUsd(value);
}

export type RechartsTooltipProps<
  KValue extends string,
  KName extends string,
  TPayload extends { [key in KValue]: ValueType } & { [key in KName]: NameType },
  TValue extends ValueType = TPayload[KValue],
  TName extends NameType = TPayload[KName],
  TBaseProps extends TooltipProps<ValueType, NameType> = TooltipProps<TValue, TName>,
  TBasePayload extends Payload<TValue, TName> = Payload<TValue, TName>
> = Omit<TBaseProps, 'payload'> & {
  payload?: Array<Omit<TBasePayload, 'payload'> & { payload: TPayload }>;
};
