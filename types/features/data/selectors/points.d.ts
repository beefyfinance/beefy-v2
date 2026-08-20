import type { PointStructureBannerConfig } from '../apis/points/types';
import type { BeefyState } from '../store/types';
export declare const selectBannersForVault: import("re-reselect").ParametricSelector<BeefyState, string, PointStructureBannerConfig[]> & {
    resultFunc: (res1: string[] | undefined, res2: {
        [x: string]: import("../apis/points/types").PointStructureConfig | undefined;
    }) => PointStructureBannerConfig[];
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: import("../apis/points/types").PointStructureConfig | undefined;
    }>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, PointStructureBannerConfig[], (res1: string[] | undefined, res2: {
        [x: string]: import("../apis/points/types").PointStructureConfig | undefined;
    }) => PointStructureBannerConfig[], [import("re-reselect").ParametricSelector<BeefyState, string, string[] | undefined>, import("re-reselect").ParametricSelector<BeefyState, string, {
        [x: string]: import("../apis/points/types").PointStructureConfig | undefined;
    }>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
