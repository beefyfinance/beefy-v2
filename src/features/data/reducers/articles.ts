import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchLastArticle } from '../actions/articles.ts';

import type { BeefyArticleConfig } from '../apis/beefy/beefy-api-types.ts';

type ArticleEntity = BeefyArticleConfig;

export type ArticlesState = {
  lastArticle: ArticleEntity | null;
  lastReadArticleId: ArticleEntity['id'] | null;
};

const initialArticlesState: ArticlesState = {
  lastArticle: null,
  lastReadArticleId: null,
};

export const articlesSlice = createSlice({
  name: 'articles',
  initialState: initialArticlesState,

  reducers: {
    setLastReadArticleId(sliceState, action: PayloadAction<ArticleEntity['id']>) {
      const articleId = action.payload;

      sliceState.lastReadArticleId = articleId;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchLastArticle.fulfilled, (sliceState, action) => {
      sliceState.lastArticle = { ...action.payload };
    });
  },
});

export const articlesActions = articlesSlice.actions;
