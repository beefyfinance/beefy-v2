import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI, type BeefyArticleConfigsResponse } from '../apis/beefy/beefy-api';
import type { BeefyState } from '../../../redux-types';

export const fetchArticles = createAsyncThunk<
  BeefyArticleConfigsResponse,
  void,
  { state: BeefyState }
>('articles/fetchArticles', async () => {
  const api = new BeefyAPI();

  return await api.getArticles();
});
