import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { chainsSlice } from '../../data/reducers/chains';
import { vaultsSlice } from '../../data/reducers/vaults';
import { tokensSlice } from '../../data/reducers/tokens';
import { tvlSlice } from '../../data/reducers/tvl';
import { apySlice } from '../../data/reducers/apy';
import { historicalApySlice } from '../../data/reducers/historical-apy';
import { balanceSlice } from '../../data/reducers/balance';
import { allowanceSlice } from '../../data/reducers/allowance';
import { boostsSlice } from '../../data/reducers/boosts';
import { dataLoaderSlice } from '../../data/reducers/data-loader';
import { walletSlice } from '../../data/reducers/wallet';
import { BeefyState } from '../../../redux-types';
import { buybackSlice } from '../../data/reducers/buyback';
import { filteredVaultsSlice } from '../../data/reducers/filtered-vaults';
import { platformsSlice } from '../../data/reducers/platforms';
import { uiThemeSlice } from '../../data/reducers/ui-theme';

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  boosts: boostsSlice.reducer,
  platforms: platformsSlice.reducer,
});
const bizReducer = combineReducers<BeefyState['biz']>({
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  historicalApy: historicalApySlice.reducer,
  buyback: buybackSlice.reducer,
});
const userReducer = combineReducers<BeefyState['user']>({
  balance: balanceSlice.reducer,
  allowance: allowanceSlice.reducer,
  wallet: persistReducer({ key: 'wallet', storage }, walletSlice.reducer),
});
const uiReducer = combineReducers<BeefyState['ui']>({
  dataLoader: dataLoaderSlice.reducer,
  filteredVaults: persistReducer({ key: 'filters', storage }, filteredVaultsSlice.reducer),
  theme: persistReducer({ key: 'theme', storage }, uiThemeSlice.reducer),
});

export const rootReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
