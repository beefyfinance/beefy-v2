import type { BeefyState } from '../../../redux-types';

export const selectReadedArticlesById = (state: BeefyState) =>
  state.entities.articles.readedArticlesById;

export const selectLastArticle = (state: BeefyState) => state.entities.articles.lastArticle;
