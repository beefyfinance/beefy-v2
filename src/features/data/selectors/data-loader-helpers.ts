import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type {
  ChainIdDataByAddressByChainEntity,
  ChainIdDataEntity,
  DataLoaderState,
  GlobalDataByAddressEntity,
  LoaderState,
  LoaderStateFulfilled,
  LoaderStateIdle,
  LoaderStatePending,
  LoaderStateRejected,
} from '../reducers/data-loader-types';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { createCachedFactory } from '../utils/factory-utils';

// time since a loader was last dispatched before it is allowed to be dispatched again
const DEFAULT_DISPATCHED_RECENT_SECONDS = 30;
// time since a loader was last fulfilled before it is allowed to be dispatched again
const DEFAULT_FULFILLED_RECENT_SECONDS = 300;

export type LoaderEvaluatorFn = (loader: LoaderState | undefined) => boolean;
export type GlobalDataSelectorFn = (state: BeefyState) => boolean;
export type ChainDataSelectorFn = (state: BeefyState, chainId: ChainEntity['id']) => boolean;
export type AddressDataSelectorFn = (state: BeefyState, walletAddress: string) => boolean;
export type AddressChainDataSelectorFn = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) => boolean;

export function isLoaderFulfilled(state: LoaderState | undefined): state is LoaderStateFulfilled {
  return !!state && state.status === 'fulfilled';
}

export function isLoaderPending(state: LoaderState | undefined): state is LoaderStatePending {
  return !!state && state.status === 'pending';
}

export function isLoaderIdle(state: LoaderState | undefined): state is LoaderStateIdle {
  return !state || state.status === 'idle';
}

export function isLoaderRejected(state: LoaderState | undefined): state is LoaderStateRejected {
  return !!state && state.status === 'rejected';
}

export function hasLoaderDispatchedOnce(state: LoaderState | undefined): boolean {
  return !!state && state.lastDispatched !== undefined;
}

export function hasLoaderFulfilledOnce(state: LoaderState | undefined): boolean {
  return !!state && state.lastFulfilled !== undefined;
}

function hasLoaderFulfilledRecentlyImpl(
  state: LoaderState | undefined,
  recentSeconds: number = DEFAULT_FULFILLED_RECENT_SECONDS
): boolean {
  return (
    !!state &&
    state.lastFulfilled !== undefined &&
    state.lastFulfilled > Date.now() - 1000 * recentSeconds
  );
}

export const createHasLoaderFulfilledRecentlyEvaluator = createCachedFactory(
  (fulfilledRecentSeconds: number = DEFAULT_FULFILLED_RECENT_SECONDS): LoaderEvaluatorFn => {
    return (state: LoaderState | undefined) =>
      hasLoaderFulfilledRecentlyImpl(state, fulfilledRecentSeconds);
  },
  fulfilledRecentSeconds => fulfilledRecentSeconds?.toString() ?? 'default'
);

export const hasLoaderFulfilledRecently = createHasLoaderFulfilledRecentlyEvaluator(
  DEFAULT_FULFILLED_RECENT_SECONDS
);

export function hasLoaderDispatchedRecentlyImpl(
  state: LoaderState | undefined,
  recentSeconds: number = DEFAULT_DISPATCHED_RECENT_SECONDS
): boolean {
  return (
    !!state &&
    state.lastDispatched !== undefined &&
    state.lastDispatched > Date.now() - 1000 * recentSeconds
  );
}

export const createHasLoaderDispatchedRecentlyEvaluator = createCachedFactory(
  (dispatchedRecentSeconds: number = DEFAULT_DISPATCHED_RECENT_SECONDS): LoaderEvaluatorFn => {
    return (state: LoaderState | undefined) =>
      hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds);
  },
  dispatchedRecentSeconds => dispatchedRecentSeconds?.toString() ?? 'default'
);

export const hasLoaderDispatchedRecently = createHasLoaderDispatchedRecentlyEvaluator(
  DEFAULT_DISPATCHED_RECENT_SECONDS
);

function shouldLoaderLoadOnceImpl(
  state: LoaderState | undefined,
  dispatchedRecentSeconds: number
): boolean {
  return (
    isLoaderIdle(state) ||
    (!hasLoaderFulfilledOnce(state) &&
      !hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds))
  );
}

export const createShouldLoaderLoadOnceEvaluator = createCachedFactory(
  (dispatchedRecentSeconds: number): LoaderEvaluatorFn => {
    return (state: LoaderState | undefined) =>
      shouldLoaderLoadOnceImpl(state, dispatchedRecentSeconds);
  },
  dispatchedRecentSeconds => dispatchedRecentSeconds.toString()
);

export const shouldLoaderLoadOnce = createShouldLoaderLoadOnceEvaluator(
  DEFAULT_DISPATCHED_RECENT_SECONDS
);

function shouldLoaderLoadRecentImpl(
  state: LoaderState | undefined,
  fulfilledRecentSeconds: number,
  dispatchedRecentSeconds: number
): boolean {
  return (
    isLoaderIdle(state) ||
    (!hasLoaderFulfilledRecentlyImpl(state, fulfilledRecentSeconds) &&
      !hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds))
  );
}

export const createShouldLoaderLoadRecentEvaluator = createCachedFactory(
  (
    fulfilledRecentSeconds: number,
    dispatchedRecentSeconds: number = DEFAULT_DISPATCHED_RECENT_SECONDS
  ): LoaderEvaluatorFn => {
    return (state: LoaderState | undefined) =>
      shouldLoaderLoadRecentImpl(state, fulfilledRecentSeconds, dispatchedRecentSeconds);
  },
  (fulfilledRecentSeconds, dispatchedRecentSeconds) =>
    `${fulfilledRecentSeconds}-${dispatchedRecentSeconds ?? 'default'}`
);

export const shouldLoaderLoadRecent = createShouldLoaderLoadRecentEvaluator(
  DEFAULT_FULFILLED_RECENT_SECONDS,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);

export function createGlobalDataSelector(
  key: keyof DataLoaderState['global'],
  evaluateFn: LoaderEvaluatorFn
): GlobalDataSelectorFn {
  return createSelector((state: BeefyState) => state.ui.dataLoader.global[key], evaluateFn);
}

export function createChainDataSelector(
  key: keyof ChainIdDataEntity,
  evaluateFn: LoaderEvaluatorFn
): ChainDataSelectorFn {
  return createCachedSelector(
    (state: BeefyState, chainId: ChainEntity['id']) =>
      state.ui.dataLoader.byChainId[chainId]?.[key],
    evaluateFn
  )((_, chainId) => chainId);
}

export function createAddressDataSelector(
  key: keyof GlobalDataByAddressEntity,
  evaluateFn: LoaderEvaluatorFn
): AddressDataSelectorFn {
  return createCachedSelector(
    (state: BeefyState, walletAddress: string) =>
      state.ui.dataLoader.byAddress[walletAddress]?.global[key],
    evaluateFn
  )((_, walletAddress) => walletAddress);
}

export function createAddressChainDataSelector(
  key: keyof ChainIdDataByAddressByChainEntity,
  evaluateFn: LoaderEvaluatorFn
): AddressChainDataSelectorFn {
  return createCachedSelector(
    (state: BeefyState, chainId: ChainEntity['id'], walletAddress: string) =>
      state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.[key],
    evaluateFn
  )((_, walletAddress) => walletAddress);
}
