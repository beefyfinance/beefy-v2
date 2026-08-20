import type { Action } from 'redux';
import type { ChainEntity } from '../entities/chain';
import type { BeefyDispatchFn, BeefyStateFn, BeefyThunk } from '../store/types';
type CapturedFulfilledActionGetter = Promise<() => Action>;
export interface CapturedFulfilledActions {
    contractData: CapturedFulfilledActionGetter;
    user: {
        balance: CapturedFulfilledActionGetter;
    } | undefined;
}
/**
 * Fetch all necessary information for the home page
 */
export declare function initAppData(dispatch: BeefyDispatchFn, getState: BeefyStateFn): Promise<void>;
export declare function manualPoll(): BeefyThunk;
export declare function fetchCaptureUserData(dispatch: BeefyDispatchFn, getState: BeefyStateFn, chainId: ChainEntity['id'], walletAddress: string): Exclude<CapturedFulfilledActions['user'], undefined>;
export declare function dispatchUserFfs(dispatch: BeefyDispatchFn, userFfs: Exclude<CapturedFulfilledActions['user'], undefined>): Promise<void>;
export {};
