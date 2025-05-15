import type { BeefyArticleConfig } from '../apis/beefy/beefy-api-types.ts';

export type ArticleEntity = BeefyArticleConfig;
export type ArticlesState = {
  lastArticle: ArticleEntity | null;
  lastReadArticleId: ArticleEntity['id'] | null;
};
