import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import { chainsSlice } from './chains.ts';
import { vaultsSlice } from './vaults.ts';
import { tokensSlice } from './tokens.ts';
import { tvlSlice } from './tvl.ts';
import { apySlice } from './apy.ts';
import { balanceSlice } from './wallet/balance.ts';
import { allowanceSlice } from './wallet/allowance.ts';
import { dataLoaderSlice } from './data-loader.ts';
import { walletSlice } from './wallet/wallet.ts';
import { bigNumberTransform, filteredVaultsSlice } from './filtered-vaults.ts';
import { platformsSlice } from './platforms.ts';
import { partnersSlice } from './partners.ts';
import { zapsSlice } from './zaps.ts';
import { walletActionsReducer } from './wallet/wallet-action.ts';
import { mintersSlice } from './minters.ts';
import { bridgeSlice } from './wallet/bridge.ts';
import { onRamp } from './on-ramp.ts';
import { feesSlice } from './fees.ts';
import { transactReducer } from './wallet/transact.ts';
import { stepperSlice } from './wallet/stepper.ts';
import { treasurySlice } from './treasury.ts';
import { analyticsSlice } from './analytics.ts';
import { proposalsSlice } from './proposals.ts';
import { historicalSlice } from './historical.ts';
import { savedVaultsSlice } from './saved-vaults.ts';
import { resolverReducer } from './wallet/resolver.ts';
import { bridgesSlice } from './bridges.ts';
import { migrationSlice } from './wallet/migration.ts';
import { addToWalletSlice } from './add-to-wallet.ts';
import { articlesSlice } from './articles.ts';
import { userRewardsReducer } from './wallet/user-rewards.ts';
import { versionReducer } from './ui-version.ts';
import { rewardsReducer } from './rewards.ts';
import { tenderlyReducer } from './tenderly.ts';
import { promosReducer } from './promos.ts';
import type { TenderlyState } from './tenderly-types.ts';
import type { Reducer } from '@reduxjs/toolkit';
import { vaultsListReducer } from './vaults-list.ts';

const entitiesReducer = combineReducers({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  promos: promosReducer,
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
const bizReducer = combineReducers({
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  partners: partnersSlice.reducer,
  historical: historicalSlice.reducer,
  rewards: rewardsReducer,
});
const userReducer = combineReducers({
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
const uiReducer = combineReducers({
  filteredVaults: persistReducer(
    {
      key: 'filters',
      storage,
      transforms: [bigNumberTransform],
      blacklist: ['filteredVaultIds', 'sortedFilteredVaultIds', 'onlyUnstakedClm'],
      version: 2, // increase this if you make changes to FilteredVaultsState
    },
    filteredVaultsSlice.reducer
  ),
  vaultsList: vaultsListReducer,
  transact: transactReducer,
  bridge: bridgeSlice.reducer,
  savedVaults: persistReducer({ key: 'savedVaults', storage }, savedVaultsSlice.reducer),
  onRamp: onRamp.reducer,
  dataLoader: dataLoaderSlice.reducer,
  stepperState: stepperSlice.reducer,
  treasury: treasurySlice.reducer,
  addToWallet: addToWalletSlice.reducer,
  version: versionReducer,
  tenderly:
    import.meta.env.DEV ?
      persistReducer(
        {
          key: 'tenderly',
          storage,
          whitelist: ['credentials'],
        },
        tenderlyReducer
      )
    : (undefined as unknown as Reducer<TenderlyState>), // undefined causes type error
});

export const rootReducer = combineReducers({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
