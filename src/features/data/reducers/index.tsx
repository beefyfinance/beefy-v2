import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import { chainsSlice } from './chains';
import { vaultsSlice } from './vaults';
import { tokensSlice } from './tokens';
import { tvlSlice } from './tvl';
import { apySlice } from './apy';
import { balanceSlice } from './wallet/balance';
import { allowanceSlice } from './wallet/allowance';
import { boostsSlice } from './boosts';
import { dataLoaderSlice } from './data-loader';
import { walletSlice } from './wallet/wallet';
import type { BeefyState } from '../../../redux-types';
import { buybackSlice } from './buyback';
import { chanIdsTransform, filteredVaultsSlice, userCategoryTransform } from './filtered-vaults';
import { platformsSlice } from './platforms';
import { uiThemeSlice } from './ui-theme';
import { partnersSlice } from './partners';
import { zapsSlice } from './zaps';
import { walletActionsReducer } from './wallet/wallet-action';
import { boostSlice } from './wallet/boost';
import { mintersSlice } from './minters';
import { infoCardsSlice } from './info-cards';
import { bridgeSlice } from './wallet/bridge';
import { onRamp } from './on-ramp';
import { feesSlice } from './fees';
import { transactReducer } from './wallet/transact';
import { stepperSlice } from './wallet/stepper';
import { ammsSlice } from './amms';
import { treasurySlice } from './treasury';
import { analyticsSlice } from './analytics';
import { proposalsSlice } from './proposals';
import { historicalSlice } from './historical';
import { savedVaultsSlice } from './saved-vaults';
import type { Reducer } from 'react';
import type { AnyAction } from '@reduxjs/toolkit';
import { resolverReducer } from './wallet/resolver';
import { bridgesSlice } from './bridges';
import { migrationSlice } from './wallet/migration';
import { tooltipsSlice } from './tooltips';

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  boosts: boostsSlice.reducer,
  fees: feesSlice.reducer,
  platforms: platformsSlice.reducer,
  zaps: zapsSlice.reducer,
  amms: ammsSlice.reducer,
  minters: mintersSlice.reducer,
  infoCards: infoCardsSlice.reducer,
  proposals: proposalsSlice.reducer,
  bridges: bridgesSlice.reducer,
});
const bizReducer = combineReducers<BeefyState['biz']>({
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  buyback: buybackSlice.reducer,
  partners: partnersSlice.reducer,
  historical: historicalSlice.reducer,
});
const userReducer = combineReducers<BeefyState['user']>({
  balance: balanceSlice.reducer,
  allowance: allowanceSlice.reducer,
  analytics: analyticsSlice.reducer,
  wallet: persistReducer(
    { key: 'wallet', storage, whitelist: ['address', 'hideBalance'] },
    walletSlice.reducer
  ),
  walletActions: walletActionsReducer,
  resolver: resolverReducer,
  migration: migrationSlice.reducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  filteredVaults: persistReducer(
    {
      key: 'filters',
      storage,
      transforms: [userCategoryTransform, chanIdsTransform],
    },
    filteredVaultsSlice.reducer
  ),
  theme: persistReducer({ key: 'theme', storage }, uiThemeSlice.reducer),
  transact: transactReducer as Reducer<BeefyState['ui']['transact'], AnyAction>,
  boost: boostSlice.reducer as Reducer<BeefyState['ui']['boost'], AnyAction>,
  bridge: bridgeSlice.reducer as Reducer<BeefyState['ui']['bridge'], AnyAction>,
  savedVaults: persistReducer({ key: 'savedVaults', storage }, savedVaultsSlice.reducer),
  onRamp: onRamp.reducer,
  dataLoader: dataLoaderSlice.reducer,
  stepperState: stepperSlice.reducer as Reducer<BeefyState['ui']['stepperState'], AnyAction>,
  treasury: treasurySlice.reducer,
  tooltips: tooltipsSlice.reducer,
});

export const rootReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
