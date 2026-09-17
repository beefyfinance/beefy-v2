import {
  createGlobalDataSelector,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldInitProposals = createGlobalDataSelector(
  'proposals',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
