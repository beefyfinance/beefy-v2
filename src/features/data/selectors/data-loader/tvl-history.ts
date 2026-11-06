import {
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  createGlobalDataSelector,
  hasLoaderSettledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldLoadTvlHistoryMonth = createGlobalDataSelector(
  'tvlHistoryMonth',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
export const selectShouldLoadTvlHistoryYear = createGlobalDataSelector(
  'tvlHistoryYear',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
export const selectIsTvlHistoryYearSettled = createGlobalDataSelector(
  'tvlHistoryYear',
  hasLoaderSettledOnce
);
