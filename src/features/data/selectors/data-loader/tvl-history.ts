import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
  isLoaderRejected,
} from '../data-loader-helpers.ts';

export const selectIsTvlHistoryMonthIdle = createGlobalDataSelector(
  'tvlHistoryMonth',
  isLoaderIdle
);
export const selectIsTvlHistoryYearIdle = createGlobalDataSelector('tvlHistoryYear', isLoaderIdle);
export const selectHasTvlHistoryMonthFulfilled = createGlobalDataSelector(
  'tvlHistoryMonth',
  hasLoaderFulfilledOnce
);
export const selectHasTvlHistoryYearFulfilled = createGlobalDataSelector(
  'tvlHistoryYear',
  hasLoaderFulfilledOnce
);
export const selectIsTvlHistoryMonthRejected = createGlobalDataSelector(
  'tvlHistoryMonth',
  isLoaderRejected
);
export const selectIsTvlHistoryYearRejected = createGlobalDataSelector(
  'tvlHistoryYear',
  isLoaderRejected
);
