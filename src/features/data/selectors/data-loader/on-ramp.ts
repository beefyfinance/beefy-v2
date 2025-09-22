import type { BeefyState } from '../../store/types.ts';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
} from '../data-loader-helpers.ts';

export const selectIsOnRampLoaded = createGlobalDataSelector('onRamp', hasLoaderFulfilledOnce);
export const selectShouldInitOnRamp = (state: BeefyState) =>
  isLoaderIdle(state.ui.dataLoader.global.onRamp);
