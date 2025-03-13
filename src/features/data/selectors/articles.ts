import type { BeefyState } from '../../../redux-types.ts';

export const selectLastReadArticleId = (state: BeefyState) =>
  state.entities.articles.lastReadArticleId;

export const selectLastArticle = (state: BeefyState) => state.entities.articles.lastArticle;
