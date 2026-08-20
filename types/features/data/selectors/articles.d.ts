import type { BeefyState } from '../store/types';
export declare const selectLastReadArticleId: (state: BeefyState) => string | null;
export declare const selectLastArticle: (state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefyArticleConfig | null;
