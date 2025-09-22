import type { BeefyState } from '../store/types.ts';

export const selectLastReadArticleId = (state: BeefyState) =>
  state.entities.articles.lastReadArticleId;

export const selectLastArticle = (state: BeefyState) => state.entities.articles.lastArticle;
