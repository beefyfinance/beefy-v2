import {
  createGlobalDataSelector,
  createShouldLoaderLoadRecentEvaluator,
} from '../data-loader-helpers.ts';

export const selectShouldLoadAllCurrentCowcentratedRanges = createGlobalDataSelector(
  'currentCowcentratedRanges',
  createShouldLoaderLoadRecentEvaluator(3 * 60),
  5
);
