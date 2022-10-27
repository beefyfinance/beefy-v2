import { intervalToDuration } from 'date-fns';
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

export function formatTimeUntil(when: Date, maxParts = 3, minParts = 3): string {
  const parts: (keyof Duration)[] = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  const numParts = parts.length;
  const duration = intervalToDuration({ start: new Date(), end: when });

  for (let i = 0; i < numParts - minParts; ++i) {
    if (duration[parts[i]]) {
      return parts
        .slice(i, i + maxParts)
        .map(part => `${zeroPad(duration[part])}${part[0]}`)
        .join(' ');
    }
  }

  return parts
    .slice(numParts - minParts)
    .map(part => `${zeroPad(duration[part] || 0)}${part[0]}`)
    .join(' ');
}
