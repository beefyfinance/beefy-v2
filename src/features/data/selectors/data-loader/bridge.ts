import {
  createGlobalDataSelector,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldLoadBridgeConfig = createGlobalDataSelector(
  'bridgeConfig',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
