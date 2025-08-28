import { createGlobalDataSelector, hasLoaderFulfilledOnce } from '../data-loader-helpers.ts';

export const selectHasWalletInitialized = createGlobalDataSelector(
  'wallet',
  hasLoaderFulfilledOnce
);
