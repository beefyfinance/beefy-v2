import type { DatabarnTimeBucket } from '../../features/data/apis/databarn/databarn-types.ts';
import type { ApiTimeBucket } from '../../features/data/apis/beefy/beefy-data-api-types.ts';
import type { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';
import type { SamplingPeriod } from '../sampling-period.ts';

/** only buckets both databarn and data apis support */
export type GraphBucket = DatabarnTimeBucket & ApiTimeBucket;

export type GraphBucketParamMap = {
  [key in GraphBucket]: {
    bucketSize: SamplingPeriod;
    timeRange: SamplingPeriod;
  };
};

export type RechartsTooltipProps<
  KValue extends string,
  KName extends string,
  TPayload extends {
    [key in KValue]: ValueType;
  } & {
    [key in KName]: NameType;
  },
  TValue extends ValueType = TPayload[KValue],
  TName extends NameType = TPayload[KName],
> = Omit<TooltipProps<TValue, TName>, 'payload'> & {
  payload?: Array<
    Omit<Payload<TValue, TName>, 'payload'> & {
      payload?: TPayload;
    }
  >;
};
