import { configureStore } from '@reduxjs/toolkit';
import { walletActionsMiddleware } from './features/data/actions/scenarios';
import { rootReducer as rootReducerV2 } from './features/redux/reducers/storev2';
import { rootReducer as rootReducerV1 } from './features/redux/reducers/index';
import { featureFlag_isDataLoaderV2Enabled } from './features/data/utils/feature-flags';

// https://coderwall.com/p/pafnew/redux-middleware-logger
// debug middleware for when redux browser extension is not helpful
const loggerMiddleware = store => next => action => {
  let prefix = '[' + new Date().toISOString().slice(11, 11 + 8 + 4) + '] ';
  let suffix = '';

  if (action.type.endsWith('/rejected')) {
    prefix += '❌❌❌ ';
  } else if (action.type.endsWith('/fulfilled')) {
    prefix += '✅ ';
  } else if (action.type.endsWith('/pending')) {
    prefix += '👀 ';
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
  if (action.type.endsWith('/error')) {
    console.group(prefix + action.type + suffix);
  } else {
    console.groupCollapsed(prefix + action.type + suffix);
  }
  try {
    const oldState = store.getState();
    console.log('current state', oldState);
    console.info(`dispatching`, action);
    let result = next(action);
    const newState = store.getState();
    console.log('next state', newState);
    return result;
  } finally {
    console.groupEnd();
  }
};

export const store = configureStore({
  reducer: rootReducerV1,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // because we use BigNumber which is not serializable by default
      // we disable rerialization altogether
      // a better solution would be to allow serialization of the store
      serializableCheck: false,
      // this makes the old code bug
      immutableCheck: false,
    }).concat([loggerMiddleware, walletActionsMiddleware]),
});

export const storeV2 = configureStore({
  reducer: rootReducerV2,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // because we use BigNumber which is not serializable by default
      // we disable rerialization altogether
      // a better solution would be to allow serialization of the store
      serializableCheck: false,
      // this makes the old code bug
      immutableCheck: false,
    }).concat([loggerMiddleware, walletActionsMiddleware]),
});
