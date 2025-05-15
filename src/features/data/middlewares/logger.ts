import type { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import type { BeefyState } from '../store/types.ts';

// debug middleware for when redux browser extension is not helpful
// https://coderwall.com/p/pafnew/redux-middleware-logger
export const loggerMiddleware =
  ({ getState }: MiddlewareAPI<Dispatch, BeefyState>) =>
  (next: Dispatch) =>
  (action: AnyAction) => {
    let prefix = '[' + new Date().toISOString().slice(11, 11 + 8 + 4) + '] ';
    let suffix = '';

    if (action.type) {
      if (action.type.endsWith('/rejected')) {
        prefix += '❌❌❌ ';
      } else if (action.type.endsWith('/fulfilled')) {
        prefix += '✅ ';
      } else if (action.type.endsWith('/pending')) {
        prefix += '👀 ';
      }
    }

    // add action arguments in the log groups for our sanity
    if (action.meta && action.meta.arg) {
      // don't use JSON.stringify to avoid implosion is args are large
      suffix +=
        ' { ' +
        Object.entries(action.meta.arg)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ') +
        ' }';
    }

    // expand errors by default otherwise, collapse
    if (action.type) {
      if (action.type.endsWith('/error')) {
        console.group(prefix + action.type + suffix);
      } else {
        console.groupCollapsed(prefix + action.type + suffix);
      }
    }
    try {
      const oldState = getState();
      console.log('current state', oldState);
      console.info(`dispatching`, action);
      const result = next(action);
      const newState = getState();
      console.log('next state', newState);
      return result;
    } finally {
      console.groupEnd();
    }
  };
