import type { BeefyLastArticleResponse } from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export const fetchLastArticle = createAppAsyncThunk<BeefyLastArticleResponse, void>(
  'articles/fetchLastArticle',
  async () => {
    const api = await getBeefyApi();

    return await api.getArticles();
  }
);
