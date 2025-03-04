import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import type { BeefyLastArticleResponse } from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';

export const fetchLastArticle = createAsyncThunk<
  BeefyLastArticleResponse,
  void,
  {
    state: BeefyState;
  }
>('articles/fetchLastArticle', async () => {
  const api = await getBeefyApi();

  return await api.getArticles();
});
