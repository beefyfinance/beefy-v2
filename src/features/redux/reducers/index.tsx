import { walletReducer } from './wallet';
import { vaultReducer } from './vault';
import { pricesReducer } from './prices';
import { balanceReducer } from './balance';
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

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  boosts: boostsSlice.reducer,
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
  wallet: walletSlice.reducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  dataLoader: dataLoaderSlice.reducer,
  filteredVaults: filteredVaultsSlice.reducer,
});

export const rootReducer = combineReducers<BeefyState>({
  walletReducer,
  vaultReducer,
  pricesReducer,
  balanceReducer,
  entities: entitiesReducer,
  biz: bizReducer,
  user: userReducer,
  ui: uiReducer,
});
