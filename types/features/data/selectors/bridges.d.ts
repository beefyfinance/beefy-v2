import type { BridgeEntity } from '../entities/bridge';
import type { BeefyState } from '../store/types';
export declare const selectBridgeById: import("re-reselect").ParametricSelector<BeefyState, string, BridgeEntity> & {
    resultFunc: (res1: {
        [x: string]: BridgeEntity | undefined;
    }, res2: string) => BridgeEntity;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: BridgeEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BridgeEntity, (res1: {
        [x: string]: BridgeEntity | undefined;
    }, res2: string) => BridgeEntity, [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: BridgeEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectBridgeByIdIfKnown: import("re-reselect").ParametricSelector<BeefyState, string, BridgeEntity | undefined> & {
    resultFunc: (res1: {
        [x: string]: BridgeEntity | undefined;
    }, res2: string) => BridgeEntity | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: BridgeEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, BridgeEntity | undefined, (res1: {
        [x: string]: BridgeEntity | undefined;
    }, res2: string) => BridgeEntity | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: BridgeEntity | undefined;
    }>, import("re-reselect").ParametricSelector<BeefyState, string, string>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectAllBridges: ((state: BeefyState) => (BridgeEntity | undefined)[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: BridgeEntity | undefined;
    }) => (BridgeEntity | undefined)[];
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: BridgeEntity | undefined;
    }) => (BridgeEntity | undefined)[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => (BridgeEntity | undefined)[];
    dependencies: [(state: BeefyState) => string[], (state: BeefyState) => {
        [x: string]: BridgeEntity | undefined;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
