import type { PromoEntity } from '../entities/promo';
import type { BeefyState } from '../store/types';
export declare const selectPromoById: (state: BeefyState, promoId: PromoEntity["id"]) => import("../entities/promo").BoostPromoEntity | import("../entities/promo").OffChainPromoEntity | import("../entities/promo").PoolPromoEntity | import("../entities/promo").AirdropPromoEntity;
export declare const selectActivePromoIdsForVault: import("re-reselect").ParametricSelector<BeefyState, string, string[]> & {
    resultFunc: (res1: string[], res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, string[], (res1: string[], res2: {
        [promoId: string]: "active" | "prestake" | "inactive";
    }) => string[], [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [promoId: string]: "active" | "prestake" | "inactive";
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectActivePromosForVault: import("re-reselect").ParametricSelector<BeefyState, string, (PromoEntity | undefined)[]> & {
    resultFunc: (res1: string[], res2: {
        [x: string]: PromoEntity | undefined;
    }) => (PromoEntity | undefined)[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, (PromoEntity | undefined)[], (res1: string[], res2: {
        [x: string]: PromoEntity | undefined;
    }) => (PromoEntity | undefined)[], [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: PromoEntity | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectActivePromoForVault: ((state: BeefyState, props: string, ...args: any[]) => PromoEntity | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: (PromoEntity | undefined)[]) => PromoEntity | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: (PromoEntity | undefined)[]) => PromoEntity | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => PromoEntity | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, (PromoEntity | undefined)[]> & {
        resultFunc: (res1: string[], res2: {
            [x: string]: PromoEntity | undefined;
        }) => (PromoEntity | undefined)[];
        dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
            [x: string]: PromoEntity | undefined;
        }>];
        recomputations: () => number;
        resetRecomputations: () => number;
    } & {
        getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, (PromoEntity | undefined)[], (res1: string[], res2: {
            [x: string]: PromoEntity | undefined;
        }) => (PromoEntity | undefined)[], [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
            [x: string]: PromoEntity | undefined;
        }>]>;
        removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
        clearCache: () => void;
        cache: import("re-reselect").ICacheObject;
        keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
