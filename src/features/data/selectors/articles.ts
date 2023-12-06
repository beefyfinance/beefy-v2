import { sortBy } from 'lodash-es';
import type { BeefyState } from '../../../redux-types';

export const selectAllArticles = (state: BeefyState) => state.entities.articles.allArticles;

export const selectReadedArticlesById = (state: BeefyState) =>
  state.entities.articles.readedArticlesById;

export const selectLastArticle = (state: BeefyState) => {
  const allArticles = selectAllArticles(state);

  //multiply by -1 means will be sorted by desc
  const sortedArticles = sortBy(allArticles, article => article.date * -1);

  return sortedArticles[0];
};
