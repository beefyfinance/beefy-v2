import type { Reducer } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { addToWalletSlice } from './add-to-wallet.ts';
import { analyticsSlice } from './analytics.ts';
import { apySlice } from './apy.ts';
import { articlesSlice } from './articles.ts';
import { bridgesSlice } from './bridges.ts';
import { beGemsReducer } from './campaigns/begems.ts';
import { chainsSlice } from './chains.ts';
import { dataLoaderSlice } from './data-loader.ts';
import { feesSlice } from './fees.ts';
import { bigNumberTransform, filteredVaultsSlice } from './filtered-vaults.ts';
import { historicalSlice } from './historical.ts';
import { mintersSlice } from './minters.ts';
import { onRamp } from './on-ramp.ts';
import { partnersSlice } from './partners.ts';
import { platformsSlice } from './platforms.ts';
import { promosReducer } from './promos.ts';
import { proposalsSlice } from './proposals.ts';
import { rewardsReducer } from './rewards.ts';
import { savedVaultsSlice } from './saved-vaults.ts';
import { tenderlyReducer } from './tenderly.ts';
import { tokensSlice } from './tokens.ts';
import { treasurySlice } from './treasury.ts';
import { tvlSlice } from './tvl.ts';
import { versionReducer } from './ui-version.ts';
import { vaultsListReducer } from './vaults-list.ts';
import { vaultsSlice } from './vaults.ts';
import { allowanceSlice } from './wallet/allowance.ts';
import { balanceSlice } from './wallet/balance.ts';
import { bridgeSlice } from './wallet/bridge.ts';
import { migrationSlice } from './wallet/migration.ts';
import { resolverReducer } from './wallet/resolver.ts';
import { stepperSlice } from './wallet/stepper.ts';
import { transactReducer } from './wallet/transact.ts';
import { userRewardsReducer } from './wallet/user-rewards.ts';
import type { WalletActionsState } from './wallet/wallet-action-types.ts';
import { walletActionsReducer } from './wallet/wallet-action.ts';
import { walletSlice } from './wallet/wallet.ts';
import { zapsSlice } from './zaps.ts';
import type { BeefyState } from '../store/types.ts';

const entitiesReducer = combineReducers({
  articles: persistReducer(
    { key: 'articles', storage, whitelist: ['lastReadArticleId'] },
    articlesSlice.reducer
  ),
  bridges: bridgesSlice.reducer,
  chains: chainsSlice.reducer,
  fees: feesSlice.reducer,
  minters: mintersSlice.reducer,
  platforms: platformsSlice.reducer,
  promos: promosReducer,
  proposals: proposalsSlice.reducer,
  tokens: tokensSlice.reducer,
  vaults: vaultsSlice.reducer,
  zaps: zapsSlice.reducer,
});
const bizReducer = combineReducers({
  apy: apySlice.reducer,
  historical: historicalSlice.reducer,
  partners: partnersSlice.reducer,
  rewards: rewardsReducer,
  tvl: tvlSlice.reducer,
});
const userReducer = combineReducers({
  allowance: allowanceSlice.reducer,
  analytics: analyticsSlice.reducer,
  balance: balanceSlice.reducer,
  migration: migrationSlice.reducer,
  resolver: resolverReducer,
  rewards: userRewardsReducer,
  wallet: persistReducer(
    { key: 'wallet', storage, whitelist: ['address', 'hideBalance'] },
    walletSlice.reducer
  ),
  walletActions: walletActionsReducer as Reducer<WalletActionsState>,
});
const uiReducer = combineReducers({
  addToWallet: addToWalletSlice.reducer,
  bridge: bridgeSlice.reducer,
  campaigns: combineReducers({
    begems: beGemsReducer,
  }),
  dataLoader: dataLoaderSlice.reducer,
  filteredVaults: persistReducer(
    {
      key: 'filters',
      storage,
      transforms: [bigNumberTransform],
      blacklist: ['filteredVaultIds', 'sortedFilteredVaultIds', 'onlyUnstakedClm', 'filterContent'],
      version: 3, // increase this if you make changes to FilteredVaultsState
    },
    filteredVaultsSlice.reducer
  ),
  onRamp: onRamp.reducer,
  savedVaults: persistReducer({ key: 'savedVaults', storage }, savedVaultsSlice.reducer),
  stepperState: stepperSlice.reducer,
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
    : undefined,
  transact: transactReducer,
  treasury: treasurySlice.reducer,
  vaultsList: vaultsListReducer,
  version: versionReducer,
});

export const rootReducer = combineReducers({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
}) satisfies (...arg: never[]) => BeefyState;
