import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
  isLoaderRejected,
} from '../data-loader-helpers.ts';

export const selectIsRevenueIdle = createGlobalDataSelector('revenue', isLoaderIdle);
export const selectHasRevenueFulfilled = createGlobalDataSelector(
  'revenue',
  hasLoaderFulfilledOnce
);
export const selectIsRevenueRejected = createGlobalDataSelector('revenue', isLoaderRejected);
