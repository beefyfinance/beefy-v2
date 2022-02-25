import { AsyncThunkAction } from '@reduxjs/toolkit';
import { Action, Store } from 'redux';
import { BeefyState } from '../../../redux-types';

/**
 * allows us to do
 *      await sleep(10 * 1000)
 *
 * Useful for polling data at regular interval with unknown network conditions
 */
export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(ms), ms);
  });
}

export type PollStop = () => void;

/**
 * Wait ms, then call fn, then wait ms, then call fn, then wait ms, etc
 *
 * The return value is a stop() function to stop looping
 */
export function poll(
  fn: () => Promise<any>,
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

  async function doPoll() {
    await sleep(ms);
    if (!paused) {
      await fn();
    }
    if (!stop) {
      // do a set timeout with no ms parameter to avoid infinite stack
      setTimeout(doPoll);
    }
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
export function createFulfilledActionCapturer(store: Store) {
  type CustomAction<T> = Action<string> & { payload: T & { state?: BeefyState } };

  /**
   * Some actions include the state in their payload
   * As we are delaying those actions from being dispatched we need
   * to update the state in this payload according to the latest state
   */
  function prepareAction(action: CustomAction<any>): () => CustomAction<any> {
    return () => {
      // replace the action state with the latest available state
      if (action.payload && action.payload.state) {
        return {
          ...action,
          payload: {
            ...action.payload,
            state: store.getState(),
          },
        };
      } else {
        return action;
      }
    };
  }

  /**
   * This function allow us to dispatch AsyncActions as soon as needed
   * We "capture" the fulfilled action to be able to dispatch it later on
   */
  return function captureFulfilledAction<Returned, ThunkArg, ThunkApiConfig>(
    asyncAction: AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig>
  ): Promise<() => Action<any>> {
    const extra = {};
    return new Promise((resolve, reject) => {
      try {
        asyncAction(
          // @ts-ignore I could not find a proper TS type here
          (action: Action<string> & { payload: any }) => {
            // if this is the fulfilled action
            if (action.type.endsWith('/fulfilled')) {
              // we don't dispatch it to the store, just pass it to our caller
              // the caller is supposed to dispatch it later on
              return resolve(prepareAction(action));
            } else if (action.type.endsWith('/rejected')) {
              // dispatch the error to the store reducers as normal
              // we reject to avoid being stuck on awaiting the returned promise
              console.error(`Rejected action: ${action.type}`);
              store.dispatch(action);
              return reject(action);
            } else if (action.type.endsWith('/pending')) {
              // dispatch the action to the store reducers as normal
              // but we don't warn our caller yet
              store.dispatch(action);
            } else {
              // this is not supposed to happen
              console.warn(`Unknown async action type provided: ${action.type}`);
              store.dispatch(action);
            }
          },
          () => store.getState(),
          extra
        );
      } catch (e) {
        reject(e);
      }
    });
  };
}
