import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectIsTreasuryLoaded = createGlobalDataSelector('treasury', hasLoaderFulfilledOnce);
export const selectShouldInitTreasury = createGlobalDataSelector('treasury', shouldLoaderLoadOnce);
