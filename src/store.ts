import { setGlobalDevModeChecks } from 'reselect';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { rootReducer } from './features/data/reducers/reducers.ts';
import { loggerMiddleware } from './features/data/middlewares/logger.ts';
import { debugRecorderMiddleware } from './features/data/middlewares/debug/debug-record.ts';
import {
  featureFlag_logReduxActions,
  featureFlag_recordReduxActions,
  featureFlag_replayReduxActions,
} from './features/data/utils/feature-flags.ts';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { BeefyState } from './redux-types.ts';
import { balanceMiddleware } from './features/data/middlewares/balance.ts';
import { apyMiddleware } from './features/data/middlewares/apy.ts';
import { transactMiddleware } from './features/data/middlewares/transact.ts';
import { filteredVaultsMiddleware } from './features/data/middlewares/filtered-vaults.ts';
import { walletMiddleware } from './features/data/middlewares/wallet.ts';
import { analyticsMiddleware } from './features/data/middlewares/analytics.ts';

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: getDefaultMiddleware => {
    const additional: Middleware[] = [];

    if (import.meta.env.DEV && featureFlag_recordReduxActions()) {
      additional.push(debugRecorderMiddleware);
    }

    if (!import.meta.env.DEV || !featureFlag_replayReduxActions()) {
      // don't want this to run actions when replaying
      additional.push(
        balanceMiddleware,
        apyMiddleware,
        transactMiddleware,
        filteredVaultsMiddleware,
        walletMiddleware,
        analyticsMiddleware
      );
    }

    if (import.meta.env.DEV && featureFlag_logReduxActions()) {
      additional.push(loggerMiddleware);
    }

    return getDefaultMiddleware({
      // because we use BigNumber which is not serializable by default
      // we disable serialization altogether
      // a better solution would be to allow serialization of the store
      serializableCheck: false,
      // this makes the old code bug
      immutableCheck: false,
    }).concat(additional);
  },
});

export const persistor = persistStore(store);
export const useAppStore = () => useStore<BeefyState>();
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<BeefyState> = useSelector;

if (import.meta.env.DEV) {
  // TODO can be enabled once selectors fixed to not trigger 1000 lines of console
  setGlobalDevModeChecks({ inputStabilityCheck: 'never', identityFunctionCheck: 'never' });
}
