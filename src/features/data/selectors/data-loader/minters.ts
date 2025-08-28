import { createGlobalDataSelector, shouldLoaderLoadOnce } from '../data-loader-helpers.ts';

export const selectShouldInitMinters = createGlobalDataSelector('minters', shouldLoaderLoadOnce);
