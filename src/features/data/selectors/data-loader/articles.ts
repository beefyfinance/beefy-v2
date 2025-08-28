import { createGlobalDataSelector, shouldLoaderLoadOnce } from '../data-loader-helpers.ts';

export const selectShouldInitArticles = createGlobalDataSelector('articles', shouldLoaderLoadOnce);
