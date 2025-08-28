import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectAreFeesLoaded = createGlobalDataSelector('fees', hasLoaderFulfilledOnce);
export const selectShouldInitFees = createGlobalDataSelector('fees', shouldLoaderLoadOnce);
