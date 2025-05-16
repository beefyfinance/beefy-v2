import { isAsyncThunkAction } from '@reduxjs/toolkit';
import type { UnknownAction } from 'redux';
import { startAppListening } from '../listener-middleware.ts';

export function addDebugLogListeners() {
  startAppListening({
    matcher: (_action: unknown): _action is UnknownAction => true,
    effect: (action, { getState, getOriginalState }) => {
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
      if (isAsyncThunkAction(action) && action.meta.arg) {
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

      console.log('current state', getOriginalState());
      console.info(`dispatching`, action);
      console.log('next state', getState());

      console.groupEnd();
    },
  });
}
