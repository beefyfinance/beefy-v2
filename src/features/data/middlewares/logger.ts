// https://coderwall.com/p/pafnew/redux-middleware-logger

import BigNumber from 'bignumber.js';
import { mapValuesDeep } from '../utils/array-utils';

// debug middleware for when redux browser extension is not helpful
export const loggerMiddleware = store => next => action => {
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
    const oldState = store.getState();
    console.log('current state', oldState);
    //console.info(`dispatching`, stringify(action));
    console.info(`dispatching`, action);
    let result = next(action);
    const newState = store.getState();
    console.log('next state', newState);
    return result;
  } finally {
    console.groupEnd();
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stringify = (o: any) =>
  mapValuesDeep(o, val => {
    if (val instanceof BigNumber) {
      return '__BIG_NUM__: ' + val.toString(10);
    } else if (val instanceof Date) {
      return '__DATE__: ' + val.toUTCString();
    } else {
      return val;
    }
  });
