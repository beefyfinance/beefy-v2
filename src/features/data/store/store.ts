import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useStore } from 'react-redux';
import { persistStore } from 'redux-persist';
import { setGlobalDevModeChecks } from 'reselect';
import { initAppData } from '../actions/scenarios.ts';
import { listenerMiddleware } from '../middlewares/listener-middleware.ts';
import { addListeners } from '../middlewares/listener-setup.ts';
import { rootReducer } from '../reducers/reducers.ts';

const rejectedActionLogger: Middleware = () => next => action => {
  const result = next(action);

  if (import.meta.env.DEV && typeof action === 'object' && action && 'type' in action) {
    const type = String(action.type);
    if (type.endsWith('/rejected')) {
      const meta = 'meta' in action && typeof action.meta === 'object' ? action.meta : undefined;
      console.error('[redux:rejected]', {
        type,
        arg: meta && 'arg' in meta ? meta.arg : undefined,
        error: 'error' in action ? action.error : undefined,
        payload: 'payload' in action ? action.payload : undefined,
      });
    }
  }

  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({
      // BigNumber can not be serialized
      serializableCheck: false,
      immutableCheck: import.meta.env.DEV,
    }).prepend(listenerMiddleware, rejectedActionLogger);
  },
});

// listeners get added after store is created otherwise there is a type-loop
addListeners();

// track tab focus/visibility
setupListeners(store.dispatch);

// start loading global data ASAP
store.dispatch(initAppData);

export const persistor = persistStore(store);

if (import.meta.env.DEV) {
  // TODO can be enabled once selectors fixed to not trigger 1000 lines of console
  setGlobalDevModeChecks({ inputStabilityCheck: 'never', identityFunctionCheck: 'never' });
}

/** @deprecated don't use the store directly */
export type BeefyStore = typeof store;

/** @deprecated don't use the store directly */
export const useAppStore = useStore.withTypes<BeefyStore>();
