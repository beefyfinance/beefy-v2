import { add, fromUnixTime, intervalToDuration, isAfter, isBefore, sub } from 'date-fns';
import { zeroPad } from './format';

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
  from?: Date | undefined
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
