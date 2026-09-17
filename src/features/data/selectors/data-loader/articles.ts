import {
  createGlobalDataSelector,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldInitArticles = createGlobalDataSelector(
  'articles',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
