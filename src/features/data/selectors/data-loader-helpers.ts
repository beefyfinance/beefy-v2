import { createSelector } from '@reduxjs/toolkit';
import { createBoundedSelector } from '../utils/selector-utils.ts';
import { createCachedSelector } from 're-reselect';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type {
  ByAddressByChainDataEntity,
  ByAddressGlobalDataEntity,
  ByChainDataEntity,
  DataLoaderState,
  LoaderNotification,
  LoaderNotificationCategory,
  LoaderState,
  LoaderStateFulfilled,
  LoaderStateIdle,
  LoaderStatePending,
  LoaderStateRejected,
} from '../reducers/data-loader-types.ts';
import type { BeefyState } from '../store/types.ts';
import { createCachedFactory } from '../utils/factory-utils.ts';
import { isEqual, sortBy, uniqBy } from 'lodash-es';
import { selectWalletAddress } from './wallet.ts';
import { getStatus, type LoaderStatuses } from '../reducers/data-loader-notifications.ts';

// time since a loader was last dispatched before it is allowed to be dispatched again
export const DEFAULT_DISPATCHED_RECENT_SECONDS = 30;
// time since a loader was last fulfilled before it is allowed to be dispatched again
const DEFAULT_FULFILLED_RECENT_SECONDS = 300;

export type LoaderEvaluatorFn<T = boolean> = (loader: LoaderState | undefined) => T;
export type GlobalDataSelectorFn<T = boolean> = (state: BeefyState) => T;
export type ChainDataSelectorFn<T = boolean> = (state: BeefyState, chainId: ChainEntity['id']) => T;
export type AddressDataSelectorFn<T = boolean> = (state: BeefyState, walletAddress: string) => T;
export type AddressChainDataSelectorFn<T = boolean> = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) => T;
export type AddressVaultDataSelectorFn<T = boolean> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress: string
) => T;

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

const CLOCK_READING_EVALUATORS = new WeakSet<object>();

function clockReading(evaluateFn: LoaderEvaluatorFn): LoaderEvaluatorFn {
  CLOCK_READING_EVALUATORS.add(evaluateFn);
  return evaluateFn;
}

export function hasLoaderFulfilledOnce(state: LoaderState | undefined): boolean {
  return !!state && state.lastFulfilled !== undefined;
}

export function hasLoaderSettledOnce(state: LoaderState | undefined): boolean {
  return !!state && (state.lastFulfilled !== undefined || state.lastRejected !== undefined);
}

function hasLoaderFulfilledRecentlyImpl(
  state: LoaderState | undefined,
  recentSeconds: number = DEFAULT_FULFILLED_RECENT_SECONDS
): boolean {
  return (
    !!state &&
    state.lastFulfilled !== undefined &&
    state.lastFulfilled.timestamp > Date.now() - 1000 * recentSeconds
  );
}

export const createHasLoaderFulfilledRecentlyEvaluator = createCachedFactory(
  (fulfilledRecentSeconds: number = DEFAULT_FULFILLED_RECENT_SECONDS): LoaderEvaluatorFn => {
    return clockReading((state: LoaderState | undefined) =>
      hasLoaderFulfilledRecentlyImpl(state, fulfilledRecentSeconds)
    );
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
    state.lastDispatched.timestamp > Date.now() - 1000 * recentSeconds
  );
}

export const createHasLoaderDispatchedRecentlyEvaluator = createCachedFactory(
  (dispatchedRecentSeconds: number = DEFAULT_DISPATCHED_RECENT_SECONDS): LoaderEvaluatorFn => {
    return clockReading((state: LoaderState | undefined) =>
      hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds)
    );
  },
  dispatchedRecentSeconds => dispatchedRecentSeconds?.toString() ?? 'default'
);

function shouldLoaderLoadOnceImpl(
  state: LoaderState | undefined,
  dispatchedRecentSeconds: number
): boolean {
  return (
    isLoaderIdle(state) ||
    (!isLoaderPending(state) &&
      !hasLoaderFulfilledOnce(state) &&
      !hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds))
  );
}

export const createShouldLoaderLoadOnceEvaluator = createCachedFactory(
  (dispatchedRecentSeconds: number): LoaderEvaluatorFn => {
    return clockReading((state: LoaderState | undefined) =>
      shouldLoaderLoadOnceImpl(state, dispatchedRecentSeconds)
    );
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
    (!isLoaderPending(state) &&
      !hasLoaderFulfilledRecentlyImpl(state, fulfilledRecentSeconds) &&
      !hasLoaderDispatchedRecentlyImpl(state, dispatchedRecentSeconds))
  );
}

export const createShouldLoaderLoadRecentEvaluator = createCachedFactory(
  (
    fulfilledRecentSeconds: number,
    dispatchedRecentSeconds: number = DEFAULT_DISPATCHED_RECENT_SECONDS
  ): LoaderEvaluatorFn => {
    return clockReading((state: LoaderState | undefined) =>
      shouldLoaderLoadRecentImpl(state, fulfilledRecentSeconds, dispatchedRecentSeconds)
    );
  },
  (fulfilledRecentSeconds, dispatchedRecentSeconds) =>
    `${fulfilledRecentSeconds}-${dispatchedRecentSeconds ?? 'default'}`
);

export const shouldLoaderLoadRecent = createShouldLoaderLoadRecentEvaluator(
  DEFAULT_FULFILLED_RECENT_SECONDS,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);

const createTimeCacheInvalidator = createCachedFactory(
  (invalidateCacheAfterSeconds: number | undefined): (() => number) => {
    return invalidateCacheAfterSeconds === undefined ?
        () => 0
      : () => Math.trunc(Date.now() / 1000 / invalidateCacheAfterSeconds);
  },
  invalidateCacheAfterSeconds => invalidateCacheAfterSeconds?.toString() ?? 'undefined'
);

const CLOCK_FREE_EVALUATORS = new Set<LoaderEvaluatorFn<unknown>>([
  isLoaderIdle,
  isLoaderPending,
  isLoaderRejected,
  hasLoaderFulfilledOnce,
  hasLoaderSettledOnce,
]);

function isClockFree<T>(
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds: number | undefined
): boolean {
  return invalidateCacheAfterSeconds === undefined && CLOCK_FREE_EVALUATORS.has(evaluateFn);
}

function assertWindowedIfClockReading<T>(
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds: number | undefined
): void {
  if (invalidateCacheAfterSeconds === undefined && CLOCK_READING_EVALUATORS.has(evaluateFn)) {
    throw new Error(
      'loader selector: an evaluator that reads the clock needs an invalidation window, or the ' +
        'memo has no input that changes with time and its answer never updates'
    );
  }
}

export function createGlobalDataSelector<T>(
  key: keyof DataLoaderState['global'],
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds?: number
): GlobalDataSelectorFn<T> {
  if (isClockFree(evaluateFn, invalidateCacheAfterSeconds)) {
    return (state: BeefyState) => evaluateFn(state.ui.dataLoader.global[key]);
  }

  assertWindowedIfClockReading(evaluateFn, invalidateCacheAfterSeconds);

  return createBoundedSelector(
    (state: BeefyState) => state.ui.dataLoader.global[key],
    createTimeCacheInvalidator(invalidateCacheAfterSeconds),
    evaluateFn
  );
}

export function createChainDataSelector<T>(
  key: keyof ByChainDataEntity,
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds?: number
): ChainDataSelectorFn<T> {
  if (isClockFree(evaluateFn, invalidateCacheAfterSeconds)) {
    return (state: BeefyState, chainId: ChainEntity['id']) =>
      evaluateFn(state.ui.dataLoader.byChainId[chainId]?.[key]);
  }

  assertWindowedIfClockReading(evaluateFn, invalidateCacheAfterSeconds);

  return createCachedSelector(
    (state: BeefyState, chainId: ChainEntity['id']) =>
      state.ui.dataLoader.byChainId[chainId]?.[key],
    createTimeCacheInvalidator(invalidateCacheAfterSeconds),
    evaluateFn
  )({ keySelector: (_, chainId) => chainId, selectorCreator: createBoundedSelector });
}

export function createAddressDataSelector<T>(
  key: keyof ByAddressGlobalDataEntity,
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds?: number
): AddressDataSelectorFn<T> {
  if (isClockFree(evaluateFn, invalidateCacheAfterSeconds)) {
    return (state: BeefyState, walletAddress: string) =>
      evaluateFn(state.ui.dataLoader.byAddress[walletAddress.toLowerCase()]?.global[key]);
  }

  assertWindowedIfClockReading(evaluateFn, invalidateCacheAfterSeconds);

  return createCachedSelector(
    (state: BeefyState, walletAddress: string) =>
      state.ui.dataLoader.byAddress[walletAddress.toLowerCase()]?.global[key],
    createTimeCacheInvalidator(invalidateCacheAfterSeconds),
    evaluateFn
  )({
    keySelector: (_, walletAddress) => walletAddress.toLowerCase(),
    selectorCreator: createBoundedSelector,
  });
}

export function createAddressChainDataSelector<T>(
  key: keyof ByAddressByChainDataEntity,
  evaluateFn: LoaderEvaluatorFn<T>,
  invalidateCacheAfterSeconds?: number
): AddressChainDataSelectorFn<T> {
  if (isClockFree(evaluateFn, invalidateCacheAfterSeconds)) {
    return (state: BeefyState, chainId: ChainEntity['id'], walletAddress: string) =>
      evaluateFn(
        state.ui.dataLoader.byAddress[walletAddress.toLowerCase()]?.byChainId[chainId]?.[key]
      );
  }

  assertWindowedIfClockReading(evaluateFn, invalidateCacheAfterSeconds);

  return createCachedSelector(
    (state: BeefyState, chainId: ChainEntity['id'], walletAddress: string) =>
      state.ui.dataLoader.byAddress[walletAddress.toLowerCase()]?.byChainId[chainId]?.[key],
    createTimeCacheInvalidator(invalidateCacheAfterSeconds),
    evaluateFn
  )({
    keySelector: (_, chainId, walletAddress) => `${chainId}-${walletAddress.toLowerCase()}`,
    selectorCreator: createBoundedSelector,
  });
}

export type LoaderNotifications = {
  [K in LoaderNotificationCategory]?: { any: boolean; global: boolean; chainIds: ChainId[] };
};

function combineNotifications(...lists: LoaderNotification[][]) {
  return sortBy(
    uniqBy(lists.flat(), n => n.key),
    n => n.key
  ).reduce((acc, curr) => {
    const entry = acc[curr.category] || { any: true, global: false, chainIds: [] };
    if (curr.chainId) {
      entry.chainIds.push(curr.chainId);
    } else {
      entry.global = true;
    }
    acc[curr.category] = entry;
    return acc;
  }, {} as LoaderNotifications);
}

export const selectStatusNotifications = createSelector(
  (state: BeefyState) => state.ui.dataLoader.statusIndicator.notifications.common,
  (state: BeefyState) => {
    const address = selectWalletAddress(state);
    return address ?
        state.ui.dataLoader.statusIndicator.notifications.byAddress[address.toLowerCase()]
      : undefined;
  },
  (common, byAddress) => {
    return combineNotifications(common, byAddress ?? []);
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

export const selectUnreadStatusNotifications = createSelector(
  (state: BeefyState) => state.ui.dataLoader.statusIndicator.notifications.common,
  (state: BeefyState) => {
    const address = selectWalletAddress(state);
    return address ?
        state.ui.dataLoader.statusIndicator.notifications.byAddress[address.toLowerCase()]
      : undefined;
  },
  (state: BeefyState) => state.ui.dataLoader.statusIndicator.ignored.common,
  (state: BeefyState) => {
    const address = selectWalletAddress(state);
    return address ?
        state.ui.dataLoader.statusIndicator.ignored.byAddress[address.toLowerCase()]
      : undefined;
  },
  (common, byAddress, ignoredCommon, ignoredByAddress) => {
    const ignored = new Set([...ignoredCommon, ...(ignoredByAddress ?? [])]);
    const notIgnored = (list: LoaderNotification[]) => list.filter(n => !ignored.has(n.key));
    return combineNotifications(notIgnored(common), notIgnored(byAddress ?? []));
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

export const selectHaveUnreadStatusNotification = createSelector(
  selectUnreadStatusNotifications,
  notifications => Object.values(notifications).some(entry => entry.any)
);

export const selectLoaderStatus = createSelector(
  (state: BeefyState) => state.ui.dataLoader.global,
  (state: BeefyState) => state.ui.dataLoader.byChainId,
  (state: BeefyState) => {
    const address = selectWalletAddress(state);
    return address ? state.ui.dataLoader.byAddress[address.toLowerCase()] : undefined;
  },
  (state: BeefyState) => state.ui.dataLoader.statusIndicator.excludeChainIds,
  getStatus,
  {
    memoizeOptions: {
      resultEqualityCheck: (a: LoaderStatuses, b: LoaderStatuses) =>
        a.rejected === b.rejected &&
        a.pending === b.pending &&
        a.fulfilled === b.fulfilled &&
        a.idle === b.idle,
    },
  }
);
