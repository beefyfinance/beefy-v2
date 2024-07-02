import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { BeefyLastArticleResponse } from '../apis/beefy/beefy-api-types';
import { getBeefyApi } from '../apis/instances';

export const fetchLastArticle = createAsyncThunk<
  BeefyLastArticleResponse,
  void,
  { state: BeefyState }
>('articles/fetchLastArticle', async () => {
  const api = await getBeefyApi();

  return await api.getArticles();
});
