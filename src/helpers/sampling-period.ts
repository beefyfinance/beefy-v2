import { keys } from './object.ts';

export const samplingPeriodMs = {
  '1sec': 1000,
  '10sec': 10 * 1000,
  '15sec': 15 * 1000,
  '30sec': 30 * 1000,
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '2hour': 2 * 60 * 60 * 1000,
  '4hour': 4 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
  '3days': 3 * 24 * 60 * 60 * 1000,
  '1week': 7 * 24 * 60 * 60 * 1000,
  '1month': 30 * 24 * 60 * 60 * 1000,
  '3months': 3 * 30 * 24 * 60 * 60 * 1000,
  '1year': 365 * 24 * 60 * 60 * 1000,
  '100year': 100 * 365 * 24 * 60 * 60 * 1000,
} as const satisfies Record<string, number>;

export type SamplingPeriod = keyof typeof samplingPeriodMs;

export const allSamplingPeriods = keys(samplingPeriodMs);
