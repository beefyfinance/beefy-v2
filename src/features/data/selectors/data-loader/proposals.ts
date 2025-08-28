import { createGlobalDataSelector, shouldLoaderLoadOnce } from '../data-loader-helpers.ts';

export const selectShouldInitProposals = createGlobalDataSelector(
  'proposals',
  shouldLoaderLoadOnce
);
