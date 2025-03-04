import type { Duration } from 'date-fns';

export type DurationSingle = {
  [K in keyof Required<Duration>]: {
    [KK in K]: NonNullable<Duration[K]>;
  };
}[keyof Duration];
