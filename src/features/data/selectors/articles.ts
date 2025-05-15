import type { BeefyState } from '../store/types.ts';
import { createGlobalDataSelector, shouldLoaderLoadOnce } from './data-loader-helpers.ts';

export const selectLastReadArticleId = (state: BeefyState) =>
  state.entities.articles.lastReadArticleId;

export const selectLastArticle = (state: BeefyState) => state.entities.articles.lastArticle;
export const selectShouldInitArticles = createGlobalDataSelector('articles', shouldLoaderLoadOnce);
