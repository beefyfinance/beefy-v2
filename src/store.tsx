import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './features/redux/reducers';

// https://coderwall.com/p/pafnew/redux-middleware-logger
// debug middleware for when redux browser extension is not helpful
const loggerMiddleware = store => next => action => {
  let prefix = '';

  if (action.type.endsWith('/rejected')) {
    prefix = '❌❌❌ ';
  } else if (action.type.endsWith('/fulfilled')) {
    prefix = '✅ ';
  } else if (action.type.endsWith('/pending')) {
    prefix = '👀 ';
  }

  console.group(prefix + action.type);
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
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // because we use BigNumber which is not serializable by default
      // we disable rerialization altogether
      // a better solution would be to allow serialization of the store
      serializableCheck: false,
      // this makes the old code bug
      immutableCheck: false,
    }).concat([loggerMiddleware]),
});
