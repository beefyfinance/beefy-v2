import type { AsyncThunkAction } from '@reduxjs/toolkit';
import type { Action, Dispatch } from 'redux';
import type { BeefyDispatchFn, BeefyState, BeefyStateFn } from '../store/types.ts';
import { createFactory } from './factory-utils.ts';

/**
 * allows us to do
 *      await sleep(10 * 1000)
 *
 * Useful for polling data at regular interval with unknown network conditions
 */
export function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

type CooperativeOptions = {
  /** how long to run uninterrupted, in ms, before handing control back to the browser */
  budgetMs?: number;
  /** cap on mappers in flight; only useful when the mapper does i/o. 0 disables the cap */
  maxPending?: number;
};

/** Promise.allSettled that yields to the browser between items */
export async function cooperativeAllSettled<TInput, TOutput>(
  inputs: TInput[],
  mapper: (input: TInput, index: number, inputs: TInput[]) => TOutput | Promise<TOutput>,
  { budgetMs = 5, maxPending = 50 }: CooperativeOptions = {}
): Promise<PromiseSettledResult<Awaited<TOutput>>[]> {
  const results: PromiseSettledResult<Awaited<TOutput>>[] = new Array(inputs.length);
  let next = 0;
  let lastYield = performance.now();

  // workers pull from a shared cursor, so concurrency is capped by how many we start and
  // results land at their input index without any bookkeeping
  const worker = async () => {
    while (next < inputs.length) {
      const index = next++;
      try {
        results[index] = { status: 'fulfilled', value: await mapper(inputs[index], index, inputs) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }

      if (performance.now() - lastYield >= budgetMs) {
        await yieldToMain();
        // measure the next budget from when we got control back, not from when we gave it up
        lastYield = performance.now();
      }
    }
  };

  const workers = maxPending > 0 ? Math.min(maxPending, inputs.length) : inputs.length;
  await Promise.all(Array.from({ length: workers }, worker));

  return results;
}

/** Hands control of main thread back to the browser */
export function yieldToMain(): Promise<void> {
  if (typeof globalThis.scheduler?.yield === 'function') {
    return globalThis.scheduler.yield();
  }

  // node: an open MessageChannel keeps the process alive, so prefer setImmediate there
  if (typeof globalThis.setImmediate === 'function') {
    return new Promise<void>(resolve => globalThis.setImmediate(resolve));
  }

  if (typeof MessageChannel === 'function') {
    return getMessageChannelYield()();
  }

  return sleep(0);
}

/** faster alternative to sleep, which has ~4ms minimum yield time */
const getMessageChannelYield = createFactory((): (() => Promise<void>) => {
  const channel = new MessageChannel();
  const port = channel.port2;
  let resolvers: Array<() => void> = [];

  channel.port1.onmessage = () => {
    const pending = resolvers;
    resolvers = [];
    for (const resolve of pending) {
      resolve();
    }
  };

  return () =>
    new Promise<void>(resolve => {
      resolvers.push(resolve);
      // first call in batch performs the yield, all resolve at once
      if (resolvers.length === 1) {
        port.postMessage(undefined);
      }
    });
});

export type PollStop = () => void;

/**
 * Wait ms, then call fn, then wait ms, then call fn, then wait ms, etc
 *
 * The return value is a stop() function to stop looping
 */
export function poll(
  fn: () => Promise<unknown>,
  ms: number,
  pauseWhenAppNotShown: boolean = true
): PollStop {
  let paused = false;
  let stop = false;

  // avoid pounding the user CPU when he joins back
  // by pausing the poll function when app is not visible
  // TODO: maybe we want some data to reload as soon as we come back
  if (pauseWhenAppNotShown) {
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  function doPoll() {
    sleep(ms)
      .then(() => {
        if (!paused) {
          return fn();
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!stop) {
          // do a set timeout with no ms parameter to avoid infinite stack
          setTimeout(doPoll);
        }
      });
  }

  doPoll();

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      paused = false;
    } else {
      paused = true;
    }
  }

  return () => {
    console.debug('Poll stopped');
    document.removeEventListener('visibilitychange', onVisibilityChange);
    stop = true;
  };
}

/**
 * Challenge:
 *  We want to start fetching data as soon as possible
 *  But some reducers depends on some previous state to have been fetched, like the TVL depends on token prices to be in the store
 *  Async thunks by redux toolkit don't allow us to delay the fulfilled dispatch until needed
 *
 * Solutions:
 *
 * ❌ Middleware: have a middleware that delay dispatches until all call dependencies have been met
 *  - could be weird when debugging
 *  - have to be smart about action parameters (chain params), etc
 *  - could be a mess to debug -> have some test
 *  - people will forget about it and make annoying mistakes?
 *  - the dependency tree encodes reducer dependencies, which is completely separate code
 *
 * ❌ Make reducers smarter:
 *  - each reducer handles data when it can
 *  - we may need to hack a new action to trigger computations
 *  - will make reducers more complex many will have to handle partial data
 *     - having to handle partial data looks "ok" from a dev perspective
 *  - we could encode dependencies directly in the reducer: in tvl, we say we depend on this and this action to be fulfilled and dispatched
 *  - we could "wrap" a reducer in some generic sauce that put "actions to be processed" in the state
 *  - but we will have to wait for 1 dispatch cycle to be able to use selectors like normal
 *  - this would be the "proper" way
 *
 * ✅ Delay dispatch of fulfilled actions: Have a scenario that call the payloadCreator function and dispatch only when needed
 *  - easy to understand, complexity will be in a single place (the scenario)
 *  - keep the state reducers simple, but keep implicit dependencies between reducers
 *  - have to separate payloadCreator function from the async action (that's ok)
 *  - will be hard to use async thunk actions without dispatching them
 *     - maybe pass a custom store and re-dispatch this store actions?
 *
 * Feel free to implement any other solution if you find it better
 */
export function createFulfilledActionCapturer(dispatch: BeefyDispatchFn, getState: BeefyStateFn) {
  type CustomAction<T> = Action<string> & {
    payload: T & {
      state?: BeefyState;
    };
  };

  /**
   * Some actions include the state in their payload
   * As we are delaying those actions from being dispatched we need
   * to update the state in this payload according to the latest state
   */
  function prepareAction(action: CustomAction<unknown>): () => CustomAction<unknown> {
    return () => {
      // replace the action state with the latest available state
      if (action.payload && action.payload.state) {
        return {
          ...action,
          payload: {
            ...action.payload,
            state: getState(),
          },
        };
      } else {
        return action;
      }
    };
  }

  type AsyncThunkConfig = {
    state?: unknown;
    dispatch?: Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
  };

  /**
   * This function allow us to dispatch AsyncActions as soon as needed
   * We "capture" the fulfilled action to be able to dispatch it later on
   */
  return function captureFulfilledAction<
    Returned,
    ThunkArg,
    ThunkApiConfig extends AsyncThunkConfig,
  >(asyncAction: AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig>): Promise<() => Action> {
    const extra = {};
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        asyncAction(
          // @ts-ignore I could not find a proper TS type here
          (action: AsyncThunkAction) => {
            // if this is the fulfilled action
            if (action.type.endsWith('/fulfilled')) {
              // we don't dispatch it to the store, just pass it to our caller
              // the caller is supposed to dispatch it later on
              return resolve(prepareAction(action));
            } else if (action.type.endsWith('/rejected')) {
              // dispatch the error to the store reducers as normal
              // we reject to avoid being stuck on awaiting the returned promise
              console.error(`Rejected action: ${action.type}`);
              dispatch(action);
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              return reject(action);
            } else if (action.type.endsWith('/pending')) {
              // dispatch the action to the store reducers as normal
              // but we don't warn our caller yet
              dispatch(action);
            } else {
              // this is not supposed to happen
              console.warn(`Unknown async action type provided: ${action.type}`);
              dispatch(action);
            }
          },
          () => getState(),
          extra
        );
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(e);
      }
    });
  };
}

/** wait at most ms for the result of a promise created */
export function withTimeoutSignal<T>(
  ms: number,
  creator: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  return Promise.race([
    creator(controller.signal),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error('Timeout'));
      }, ms);
    }),
  ]);
}
