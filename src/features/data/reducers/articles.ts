import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchArticles } from '../actions/articles';
import type { BeefyArticleConfig } from '../apis/beefy/beefy-api';

type ArticleEntity = BeefyArticleConfig & { id: string };

export type articlesState = {
  allArticles: ArticleEntity[];
  readedArticlesById: Record<ArticleEntity['id'], boolean>;
};

const initialArticlesState: articlesState = {
  allArticles: [],
  readedArticlesById: {},
};

export const articlesSlice = createSlice({
  name: 'articles',
  initialState: initialArticlesState,

  reducers: {
    setReadedArticleById(sliceState, action: PayloadAction<ArticleEntity['id']>) {
      const articleId = action.payload;

      sliceState.readedArticlesById[articleId] = true;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchArticles.fulfilled, (sliceState, action) => {
      const articles = action.payload;

      const allArticles = [];
      for (const [id, article] of Object.entries(articles)) {
        allArticles.push({ id, ...article });
      }

      sliceState.allArticles = allArticles;
    });
  },
});

export const articlesActions = articlesSlice.actions;
