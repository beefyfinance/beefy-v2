import { createGlobalDataSelector, hasLoaderFulfilledOnce } from '../data-loader-helpers.ts';

export const selectAreFeesLoaded = createGlobalDataSelector('fees', hasLoaderFulfilledOnce);
