import type { PayloadAction } from '@reduxjs/toolkit';
import type { ArticleEntity, ArticlesState } from './articles-types';
export declare const articlesSlice: import("@reduxjs/toolkit").Slice<ArticlesState, {
    setLastReadArticleId(sliceState: import("immer").WritableDraft<ArticlesState>, action: PayloadAction<ArticleEntity["id"]>): void;
}, "articles", "articles", import("@reduxjs/toolkit").SliceSelectors<ArticlesState>>;
export declare const articlesActions: import("@reduxjs/toolkit").CaseReducerActions<{
    setLastReadArticleId(sliceState: import("immer").WritableDraft<ArticlesState>, action: PayloadAction<ArticleEntity["id"]>): void;
}, "articles">;
