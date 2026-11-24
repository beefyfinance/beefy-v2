import type { TvlHistoryBucket } from '../actions/tvl-history.ts';
import type { BeefyState } from '../store/types.ts';
import type { TimePointWithMa } from '../utils/platform-stats.ts';
import { EMPTY_ARRAY } from '../utils/selector-utils.ts';

export const selectTvlHistory = (state: BeefyState, bucket: TvlHistoryBucket): TimePointWithMa[] =>
  state.biz.tvlHistory.byBucket[bucket] ?? EMPTY_ARRAY;
