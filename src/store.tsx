import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { rootReducer } from './features/data/reducers';
import { loggerMiddleware } from './features/data/middlewares/logger';
import { walletActionsMiddleware } from './features/data/middlewares/wallet';
import { debugRecorderMiddleware } from './features/data/middlewares/debug/debug-record';
import {
  featureFlag_logReduxActions,
  featureFlag_recordReduxActions,
  featureFlag_replayReduxActions,
} from './features/data/utils/feature-flags';
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { BeefyState } from './redux-types';

let middlewares = [];

if (featureFlag_logReduxActions()) {
  middlewares = [...middlewares, loggerMiddleware];
}

if (featureFlag_recordReduxActions()) {
  middlewares = [debugRecorderMiddleware, ...middlewares];
}

if (!featureFlag_replayReduxActions()) {
  // don't want this to run actions when replaying
  middlewares = [...middlewares, walletActionsMiddleware];
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // because we use BigNumber which is not serializable by default
      // we disable serialization altogether
      // a better solution would be to allow serialization of the store
      serializableCheck: false,
      // this makes the old code bug
      immutableCheck: false,
    }).concat(middlewares),
});

export const persistor = persistStore(store);
export const useAppStore = () => useStore<BeefyState>();
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<BeefyState> = useSelector;
