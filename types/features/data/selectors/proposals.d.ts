import type { ProposalEntity } from '../entities/proposal';
import type { BeefyState } from '../store/types';
export declare function selectAllProposalIds(state: BeefyState): ProposalEntity['id'][];
export declare const selectAllProposalIdsBySpace: (state: BeefyState, space: string) => string[];
export declare function selectProposalById(state: BeefyState, id: ProposalEntity['id']): ProposalEntity | undefined;
export declare const selectAllProposals: ((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [typeof selectAllProposalIds, (state: BeefyState) => {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllProposalsBySpace: import("re-reselect").ParametricSelector<BeefyState, string, import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]> & {
    resultFunc: (res1: string[], res2: {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], (res1: string[], res2: {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], [import("re-reselect").ParametricSelector<BeefyState, string, string[]>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
export declare const selectAllActiveProposals: ((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
            [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
        }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
        memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
            [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
        }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
        dependencies: [typeof selectAllProposalIds, (state: BeefyState) => {
            [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, () => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllActiveProposalsBySpace: ((state: BeefyState, space: string) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [(state: BeefyState, space: string) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], () => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectUnreadActiveProposals: ((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: string[]) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: string[]) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
        memoizedResultFunc: ((resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: number) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
        dependencies: [((state: BeefyState) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: string[], resultFuncArgs_1: {
                [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
            }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
            memoizedResultFunc: ((resultFuncArgs_0: string[], resultFuncArgs_1: {
                [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
            }) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
            dependencies: [typeof selectAllProposalIds, (state: BeefyState) => {
                [x: string]: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal | undefined;
            }];
            recomputations: () => number;
            resetRecomputations: () => void;
            dependencyRecomputations: () => number;
            resetDependencyRecomputations: () => void;
        } & {
            argsMemoize: typeof import("reselect").weakMapMemoize;
            memoize: typeof import("reselect").weakMapMemoize;
        }, () => number];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: BeefyState) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectUnreadActiveProposalsBySpace: ((state: BeefyState, space: string) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: string[]) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    memoizedResultFunc: ((resultFuncArgs_0: import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], resultFuncArgs_1: string[]) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[];
    dependencies: [(state: BeefyState, space: string) => import("../apis/beefy/beefy-api-types").BeefySnapshotProposal[], (state: BeefyState) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
