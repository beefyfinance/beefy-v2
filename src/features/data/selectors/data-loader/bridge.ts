import { createGlobalDataSelector, shouldLoaderLoadOnce } from '../data-loader-helpers.ts';

export const selectShouldLoadBridgeConfig = createGlobalDataSelector(
  'bridgeConfig',
  shouldLoaderLoadOnce
);
