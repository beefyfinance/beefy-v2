import { add, intervalToDuration } from 'date-fns';
import { zeroPad } from './format';

export function datesAreEqual(a: Date | null, b: Date | null): boolean {
  // both are the same Date object, or both are null
  if (a === b) {
    return true;
  }

  // one is null, the other is not
  if (a === null || b === null) {
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
