import type { BeefyState } from '../../../redux-types';

export const selectLastReadArticleId = (state: BeefyState) =>
  state.entities.articles.lastReadArticleId;

export const selectLastArticle = (state: BeefyState) => state.entities.articles.lastArticle;
