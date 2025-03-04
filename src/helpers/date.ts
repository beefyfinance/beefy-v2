import {
  add,
  fromUnixTime,
  intervalToDuration,
  isAfter,
  isBefore,
  sub,
  type Duration,
} from 'date-fns';
import { zeroPad } from './format.ts';
import type { DurationSingle } from './date-types.ts';
import type { OptionalRecord } from '../features/data/utils/types-utils.ts';
import { firstKey } from './object.ts';

export function datesAreEqual(a: Date | undefined, b: Date | undefined): boolean {
  // both are the same Date object, or both are undefined
  if (a === b) {
    return true;
  }

  // one is undefined, the other is not
  if (a === undefined || b === undefined) {
    return false;
  }

  return a.getTime() === b.getTime();
}

export function formatTimeUntil(
  when: Date,
  maxParts: number = 3,
  minParts: number = 3,
  padLength: number = 2,
  from?: Date
): string {
  const parts: (keyof Duration)[] = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  const numParts = parts.length;
  const duration = intervalToDuration({ start: from || new Date(), end: when });

  for (let i = 0; i < numParts - minParts; ++i) {
    if (duration[parts[i]]) {
      return parts
        .slice(i, i + maxParts)
        .map(part => `${zeroPad(duration[part], padLength)}${part[0]}`)
        .join(' ');
    }
  }

  return parts
    .slice(numParts - minParts)
    .map(part => `${zeroPad(duration[part] || 0, padLength)}${part[0]}`)
    .join(' ');
}

export function roundDownMinutes(date: Date) {
  date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
  return date;
}

export function formatMinutesDuration(minutes: number): string {
  const now = new Date();
  const later = add(now, { minutes });
  return formatTimeUntil(later, 1, 1, 1, now);
}

const durationUnits = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const satisfies (keyof Duration)[];

export function isDurationEqual(base: Duration, compareTo: Duration): boolean {
  return durationUnits.every(unit => base[unit] === compareTo[unit]);
}

const durationFieldToSeconds: Record<keyof Duration, number> = {
  years: 60 * 60 * 24 * 365,
  months: 60 * 60 * 24 * 30,
  weeks: 60 * 60 * 24 * 7,
  days: 60 * 60 * 24,
  hours: 60 * 60,
  minutes: 60,
  seconds: 1,
};

const durationFieldToField: OptionalRecord<
  keyof Duration,
  OptionalRecord<keyof Duration, number>
> = {
  weeks: {
    years: 1 / 52,
  },
  months: {
    years: 1 / 12,
  },
  years: {
    months: 12,
    weeks: 52,
  },
};

export function convertDurationField(
  value: number,
  from: keyof Duration,
  to: keyof Duration
): number {
  if (from === to) {
    return value;
  }

  const multiplier = durationFieldToField[from]?.[to];
  if (multiplier !== undefined) {
    return value * multiplier;
  }

  return (value * durationFieldToSeconds[from]) / durationFieldToSeconds[to];
}

export function convertDurationSingle(
  duration: DurationSingle,
  to: keyof Duration
): DurationSingle {
  const from = firstKey(duration);
  const wideDuration: Duration = duration;
  if (!from || !wideDuration[from]) {
    throw new Error('DurationSingle is empty');
  }
  return {
    [to]: convertDurationField(wideDuration[from], from, to),
  } as DurationSingle;
}

export function isLonger(base: Duration, compareTo: Duration): boolean {
  if (isDurationEqual(base, compareTo)) {
    return false;
  }
  const now = new Date();
  const baseDate = add(now, base);
  const compareToDate = add(now, compareTo);
  return isAfter(baseDate, compareToDate);
}

/** whether it has been at least `duration` since `date` */
export function isMoreThanDurationAgo(date: Date, duration: Duration): boolean {
  return isBefore(date, sub(new Date(), duration));
}

export function isMoreThanDurationAgoUnix(unixDate: number, duration: Duration): boolean {
  return isMoreThanDurationAgo(fromUnixTime(unixDate), duration);
}

export function isLessThanDurationAgo(date: Date, duration: Duration): boolean {
  return isAfter(date, sub(new Date(), duration));
}

export function isLessThanDurationAgoUnix(unixDate: number, duration: Duration): boolean {
  return isLessThanDurationAgo(fromUnixTime(unixDate), duration);
}

export function getUnixNow(): number {
  return Math.trunc(Date.now() / 1000);
}
