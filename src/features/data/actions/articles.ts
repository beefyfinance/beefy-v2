import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyAPI, type BeefyLastArticleResponse } from '../apis/beefy/beefy-api';
import type { BeefyState } from '../../../redux-types';

export const fetchLastArticle = createAsyncThunk<
  BeefyLastArticleResponse,
  void,
  { state: BeefyState }
>('articles/fetchLastArticle', async () => {
  const api = new BeefyAPI();

  return await api.getArticles();
});
