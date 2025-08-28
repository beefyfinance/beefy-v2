import { createGlobalDataSelector, hasLoaderFulfilledOnce } from '../data-loader-helpers.ts';

export const selectIsApyAvailable = createGlobalDataSelector('apy', hasLoaderFulfilledOnce);
export const selectIsAvgApyAvailable = createGlobalDataSelector('avgApy', hasLoaderFulfilledOnce);
