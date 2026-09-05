import { createSelector } from '@reduxjs/toolkit';
import {
  createGlobalDataSelector,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
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
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
export const selectShouldInitZapSwapAggregators = createGlobalDataSelector(
  'zapSwapAggregators',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
export const selectShouldInitZapAggregatorTokenSupport = createGlobalDataSelector(
  'zapAggregatorTokenSupport',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
export const selectShouldInitZapAmms = createGlobalDataSelector(
  'zapAmms',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);
