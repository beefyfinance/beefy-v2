import {
  createAddressDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
} from '../data-loader-helpers.ts';

export const selectIsAnalyticsLoadedByAddress = createAddressDataSelector(
  'timeline',
  hasLoaderFulfilledOnce
);
export const selectIsAnalyticsIdleByAddress = createAddressDataSelector('timeline', isLoaderIdle);
export const selectIsClmHarvestsLoadedByAddress = createAddressDataSelector(
  'clmHarvests',
  hasLoaderFulfilledOnce
);
