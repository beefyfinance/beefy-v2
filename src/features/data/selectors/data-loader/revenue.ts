import { createGlobalDataSelector, hasLoaderSettledOnce } from '../data-loader-helpers.ts';

export const selectIsRevenueSettled = createGlobalDataSelector('revenue', hasLoaderSettledOnce);
