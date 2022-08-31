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
import { depositSlice } from './wallet/deposit';
import { walletActionsReducer } from './wallet/wallet-action';
import { withdrawSlice } from './wallet/withdraw';
import { boostModalSlice } from './wallet/boost-modal';
import { mintersSlice } from './minters';
import { infoCardsSlice } from './info-cards';
import { bridgeModalSlice } from './wallet/bridge-modal';
import { onRamp } from './on-ramp';
import { feesSlice } from './fees';

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  boosts: boostsSlice.reducer,
  fees: feesSlice.reducer,
  platforms: platformsSlice.reducer,
  zaps: zapsSlice.reducer,
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
  deposit: depositSlice.reducer,
  withdraw: withdrawSlice.reducer,
  boostModal: boostModalSlice.reducer,
  bridgeModal: bridgeModalSlice.reducer,
  onRamp: onRamp.reducer,
  dataLoader: dataLoaderSlice.reducer,
});

export const rootReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
