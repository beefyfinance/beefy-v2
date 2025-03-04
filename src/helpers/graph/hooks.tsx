import { useMemo } from 'react';
import { domainOffSet, getXInterval, makeDateTimeTickFormatter, mapRangeToTicks } from './graph.ts';
import type { GraphBucket } from './types.ts';

export function useYAxis(
  min: number,
  max: number,
  formatterBuilder: (domain: [number, number]) => (value: number) => string,
  domainOffsetPercent: number = 0.88
) {
  if (min === max) {
    min = min * 0.9;
    max = max * 1.1;
  }

  return useMemo(() => {
    const diff = domainOffSet(min, max, domainOffsetPercent);
    const start = Math.max(0, min - diff);
    const end = max + diff;
    const domain = [start, end] as [number, number];
    const ticks = mapRangeToTicks(start, end);

    return {
      domain,
      ticks,
      formatter: formatterBuilder(domain),
    };
  }, [min, max, domainOffsetPercent, formatterBuilder]);
}

export function useXAxis(timeBucket: GraphBucket, dataLength: number, xsDown: boolean) {
  return useMemo(() => {
    return {
      interval: getXInterval(dataLength, xsDown),
      formatter: makeDateTimeTickFormatter(timeBucket),
    };
  }, [timeBucket, xsDown, dataLength]);
}
