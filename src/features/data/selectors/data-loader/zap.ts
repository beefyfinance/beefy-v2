import { createSelector } from '@reduxjs/toolkit';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

const selectIsZapConfigsLoaded = createGlobalDataSelector('zapConfigs', hasLoaderFulfilledOnce);
const selectIsZapSwapAggregatorsLoaded = createGlobalDataSelector(
  'zapSwapAggregators',
  hasLoaderFulfilledOnce
);
const selectIsZapAggregatorTokenSupportLoaded = createGlobalDataSelector(
  'zapAggregatorTokenSupport',
  hasLoaderFulfilledOnce
);
const selectIsZapAmmsLoaded = createGlobalDataSelector('zapAmms', hasLoaderFulfilledOnce);
export const selectIsZapLoaded = createSelector(
  selectIsZapConfigsLoaded,
  selectIsZapSwapAggregatorsLoaded,
  selectIsZapAggregatorTokenSupportLoaded,
  selectIsZapAmmsLoaded,
  (...availables) => availables.every(available => available === true)
);
export const selectShouldInitZapConfigs = createGlobalDataSelector(
  'zapConfigs',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapSwapAggregators = createGlobalDataSelector(
  'zapSwapAggregators',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapAggregatorTokenSupport = createGlobalDataSelector(
  'zapAggregatorTokenSupport',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapAmms = createGlobalDataSelector('zapAmms', shouldLoaderLoadOnce);
