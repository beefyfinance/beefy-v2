import {
  createGlobalDataSelector,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldInitMinters = createGlobalDataSelector(
  'minters',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
