import type {
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
  ClmTimelineEntryClassic,
  ClmTimelineEntryClm,
} from './clm-api-types.ts';

export function isClmTimelineEntryClassic(
  config: ClmTimelineEntryClm | ClmTimelineEntryClassic
): config is ClmTimelineEntryClassic {
  return config.type === 'classic';
}

export function isClmPriceHistoryEntryClm(
  entry: ClmPriceHistoryEntryClm | ClmPriceHistoryEntryClassic
): entry is ClmPriceHistoryEntryClm {
  return entry.type === 'clm';
}

export function isClmPriceHistoryEntriesClm(
  entries: Array<ClmPriceHistoryEntryClm | ClmPriceHistoryEntryClassic>
): entries is Array<ClmPriceHistoryEntryClm> {
  return entries.every(isClmPriceHistoryEntryClm);
}
