import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchLastArticle } from '../actions/articles';
import type { BeefyArticleConfig } from '../apis/beefy/beefy-api';

type ArticleEntity = BeefyArticleConfig;

export type articlesState = {
  lastArticle: ArticleEntity | null;
  readedArticlesById: Record<ArticleEntity['id'], boolean>;
};

const initialArticlesState: articlesState = {
  lastArticle: null,
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
    builder.addCase(fetchLastArticle.fulfilled, (sliceState, action) => {
      sliceState.lastArticle = { ...action.payload, date: 1702498233 };
    });
  },
});

export const articlesActions = articlesSlice.actions;
