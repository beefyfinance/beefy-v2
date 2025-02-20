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
import { dataLoaderSlice } from './data-loader';
import { walletSlice } from './wallet/wallet';
import type { BeefyState } from '../../../redux-types';
import {
  bigNumberTransform,
  chainIdsTransform,
  filteredVaultsSlice,
  userCategoryTransform,
} from './filtered-vaults';
import { platformsSlice } from './platforms';
import { uiThemeSlice } from './ui-theme';
import { partnersSlice } from './partners';
import { zapsSlice } from './zaps';
import { walletActionsReducer } from './wallet/wallet-action';
import { mintersSlice } from './minters';
import { bridgeSlice } from './wallet/bridge';
import { onRamp } from './on-ramp';
import { feesSlice } from './fees';
import { transactReducer } from './wallet/transact';
import { stepperSlice } from './wallet/stepper';
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
import { addToWalletSlice } from './add-to-wallet';
import { articlesSlice } from './articles';
import { userRewardsReducer } from './wallet/user-rewards';
import { versionReducer } from './ui-version';
import { rewardsReducer } from './rewards';
import { tenderlyReducer } from './tenderly';
import { promosReducer } from './promos';

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  promos: promosReducer as Reducer<BeefyState['entities']['promos'], AnyAction>, // WritableDraft and BigNumber types do not play well together
  fees: feesSlice.reducer,
  platforms: platformsSlice.reducer,
  zaps: zapsSlice.reducer,
  minters: mintersSlice.reducer,
  proposals: proposalsSlice.reducer,
  bridges: bridgesSlice.reducer,
  articles: persistReducer(
    { key: 'articles', storage, whitelist: ['lastReadArticleId'] },
    articlesSlice.reducer
  ),
});
const bizReducer = combineReducers<BeefyState['biz']>({
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  partners: partnersSlice.reducer,
  historical: historicalSlice.reducer,
  rewards: rewardsReducer,
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
  rewards: userRewardsReducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  filteredVaults: persistReducer(
    {
      key: 'filters',
      storage,
      transforms: [bigNumberTransform, userCategoryTransform, chainIdsTransform],
      blacklist: ['filteredVaultIds', 'sortedFilteredVaultIds', 'onlyUnstakedClm'],
    },
    filteredVaultsSlice.reducer
  ),
  theme: persistReducer({ key: 'theme', storage }, uiThemeSlice.reducer),
  transact: transactReducer as Reducer<BeefyState['ui']['transact'], AnyAction>,
  bridge: bridgeSlice.reducer as Reducer<BeefyState['ui']['bridge'], AnyAction>,
  savedVaults: persistReducer({ key: 'savedVaults', storage }, savedVaultsSlice.reducer),
  onRamp: onRamp.reducer,
  dataLoader: dataLoaderSlice.reducer,
  stepperState: stepperSlice.reducer as Reducer<BeefyState['ui']['stepperState'], AnyAction>,
  treasury: treasurySlice.reducer,
  tooltips: tooltipsSlice.reducer,
  addToWallet: addToWalletSlice.reducer,
  version: versionReducer,
  tenderly: import.meta.env.DEV
    ? persistReducer(
        {
          key: 'tenderly',
          storage,
          whitelist: ['credentials'],
        },
        tenderlyReducer
      )
    : undefined,
});

export const rootReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
