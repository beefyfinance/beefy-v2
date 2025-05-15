import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchLastArticle } from '../actions/articles.ts';
import type { ArticleEntity, ArticlesState } from './articles-types.ts';

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
