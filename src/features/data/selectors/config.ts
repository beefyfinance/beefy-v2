import { createSelector } from '@reduxjs/toolkit';
import {
  createGlobalDataSelector,
  type GlobalDataSelectorFn,
  hasLoaderFulfilledOnce,
} from './data-loader-helpers.ts';

export const selectIsChainConfigAvailable = createGlobalDataSelector(
  'chainConfig',
  hasLoaderFulfilledOnce
);
export const selectIsVaultsAvailable = createGlobalDataSelector('vaults', hasLoaderFulfilledOnce);
export const selectIsPromosAvailable = createGlobalDataSelector('promos', hasLoaderFulfilledOnce);
export const selectIsPlatformsAvailable = createGlobalDataSelector(
  'platforms',
  hasLoaderFulfilledOnce
);
export const selectIsConfigAvailable: GlobalDataSelectorFn = createSelector(
  selectIsChainConfigAvailable,
  selectIsVaultsAvailable,
  selectIsPromosAvailable,
  selectIsPlatformsAvailable,
  (...availables) => availables.every(available => available === true)
);
