import type { VaultFee } from '../reducers/fees-types';
import type { BeefyState } from '../store/types';
export declare const selectFeesByVaultId: import("re-reselect").ParametricSelector<BeefyState, string, VaultFee | undefined> & {
    resultFunc: (res1: number, res2: boolean, res3: VaultFee | undefined) => VaultFee | undefined;
    dependencies: [import("re-reselect").ParametricSelector<BeefyState, string, number>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>, import("re-reselect").ParametricSelector<BeefyState, string, VaultFee | undefined>];
    recomputations: () => number;
    resetRecomputations: () => number;
} & {
    getMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => import("re-reselect").OutputParametricSelector<BeefyState, string, VaultFee | undefined, (res1: number, res2: boolean, res3: VaultFee | undefined) => VaultFee | undefined, [import("re-reselect").ParametricSelector<BeefyState, string, number>, import("re-reselect").ParametricSelector<BeefyState, string, boolean>, import("re-reselect").ParametricSelector<BeefyState, string, VaultFee | undefined>]>;
    removeMatchingSelector: (state: BeefyState, props: string, ...args: any[]) => void;
    clearCache: () => void;
    cache: import("re-reselect").ICacheObject;
    keySelector: import("re-reselect").ParametricKeySelector<BeefyState, string>;
};
