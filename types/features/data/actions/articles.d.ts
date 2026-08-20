export declare const fetchLastArticle: import("@reduxjs/toolkit").AsyncThunk<import("../apis/beefy/beefy-api-types").BeefyArticleConfig, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
