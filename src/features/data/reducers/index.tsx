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
import { BeefyState } from '../../../redux-types';
import { buybackSlice } from './buyback';
import { filteredVaultsSlice } from './filtered-vaults';
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
});
const bizReducer = combineReducers<BeefyState['biz']>({
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  buyback: buybackSlice.reducer,
  partners: partnersSlice.reducer,
});
const userReducer = combineReducers<BeefyState['user']>({
  balance: balanceSlice.reducer,
  allowance: allowanceSlice.reducer,
  wallet: persistReducer(
    { key: 'wallet', storage, whitelist: ['address', 'hideBalance', 'profilePictureUrl'] },
    walletSlice.reducer
  ),
  walletActions: walletActionsReducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  filteredVaults: persistReducer({ key: 'filters', storage }, filteredVaultsSlice.reducer),
  theme: persistReducer({ key: 'theme', storage }, uiThemeSlice.reducer),
  transact: transactReducer,
  boost: boostSlice.reducer,
  bridge: bridgeSlice.reducer,
  onRamp: onRamp.reducer,
  dataLoader: dataLoaderSlice.reducer,
  stepperState: stepperSlice.reducer,
  treasury: treasurySlice.reducer,
});

export const rootReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
