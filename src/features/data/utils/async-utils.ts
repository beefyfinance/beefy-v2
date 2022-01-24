import { AsyncThunkAction } from '@reduxjs/toolkit';
import { Action, Store } from 'redux';

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
export function poll(fn: () => Promise<any>, ms: number): PollStop {
  let stop = false;

  async function doPoll() {
    await sleep(ms);
    await fn();
    if (!stop) {
      // do a set timeout with no ms parameter to avoid infinite stack
      setTimeout(doPoll);
    }
  }
  doPoll();

  return () => {
    stop = true;
  };
}

export function createFulfilledActionCapturer(store: Store) {
  /**
   * This function allow us to dispatch AsyncActions as soon as needed
   * We "capture" the fulfilled action to be able to dispatch it later on
   */
  return function captureFulfilledAction<Returned, ThunkArg, ThunkApiConfig>(
    asyncAction: AsyncThunkAction<Returned, ThunkArg, ThunkApiConfig>
  ): Promise<() => Action<any>> {
    const extra = {};
    return new Promise((resolve, reject) => {
      asyncAction(
        // @ts-ignore I could not find a proper TS type here
        (action: Action<string> & { payload: any }) => {
          // if this is the fulfilled action
          if (action.type.endsWith('/fulfilled')) {
            // we don't dispatch it to the store, just pass it to our caller
            // the caller is supposed to dispatch it later on
            console.debug(`Fulfilled action: ${action.type}`);
            return resolve(() => {
              // replace the action state with the latest available state
              if (action.payload && action.payload.state) {
                return {
                  ...action,
                  //@ts-ignore I could not find a proper TS type here
                  payload: {
                    ...action.payload,
                    state: store.getState(),
                  },
                };
              } else {
                return action;
              }
            });
          } else if (action.type.endsWith('/error')) {
            // dispatch the error to the store reducers as normal
            // we reject to avoid being stuck on awaiting the returned promise
            console.debug(`Error action: ${action.type}`);
            store.dispatch(action);
            return reject(action);
          } else if (action.type.endsWith('/pending')) {
            // dispatch the action to the store reducers as normal
            // but we don't warn our caller yet
            console.debug(`Pending action: ${action.type}`);
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
    });
  };
}
