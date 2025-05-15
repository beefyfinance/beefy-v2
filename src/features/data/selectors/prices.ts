import { createGlobalDataSelector, hasLoaderFulfilledOnce } from './data-loader-helpers.ts';

export const selectIsPricesAvailable = createGlobalDataSelector('prices', hasLoaderFulfilledOnce);
