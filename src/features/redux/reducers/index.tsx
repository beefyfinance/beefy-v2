import { walletReducer } from './wallet';
import { vaultReducer } from './vault';
import { pricesReducer } from './prices';
import { balanceReducer } from './balance';
import { combineReducers } from 'redux';

export const rootReducer = combineReducers({
  walletReducer,
  vaultReducer,
  pricesReducer,
  balanceReducer,
});
