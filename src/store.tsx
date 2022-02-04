import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './features/redux/reducers';
import { loggerMiddleware } from './features/data/middlewares/logger';
import { walletActionsMiddleware } from './features/data/middlewares/wallet';

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
    }).concat([loggerMiddleware, walletActionsMiddleware]),
});
