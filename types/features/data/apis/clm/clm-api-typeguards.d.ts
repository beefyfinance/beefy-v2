import type { ClmPriceHistoryEntryClassic, ClmPriceHistoryEntryClm, ClmTimelineEntryClassic, ClmTimelineEntryClm } from './clm-api-types';
export declare function isClmTimelineEntryClassic(config: ClmTimelineEntryClm | ClmTimelineEntryClassic): config is ClmTimelineEntryClassic;
export declare function isClmPriceHistoryEntryClm(entry: ClmPriceHistoryEntryClm | ClmPriceHistoryEntryClassic): entry is ClmPriceHistoryEntryClm;
export declare function isClmPriceHistoryEntriesClm(entries: Array<ClmPriceHistoryEntryClm | ClmPriceHistoryEntryClassic>): entries is Array<ClmPriceHistoryEntryClm>;
