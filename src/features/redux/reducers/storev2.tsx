import { walletReducer } from './wallet';
import { vaultReducer } from './vault';
import { pricesReducer } from './prices';
import { balanceReducer } from './balance';
import { combineReducers } from 'redux';
import { chainsSlice, ChainsState } from '../../data/reducers/chains';
import { vaultsSlice, VaultsState } from '../../data/reducers/vaults';
import { tokensSlice, TokensState } from '../../data/reducers/tokens';
import { tvlSlice, TvlState } from '../../data/reducers/tvl';
import { apySlice, ApyState } from '../../data/reducers/apy';
import { historicalApySlice, HistoricalApyState } from '../../data/reducers/historical-apy';
import { balanceSlice, BalanceState } from '../../data/reducers/balance';
import { allowanceSlice, AllowanceState } from '../../data/reducers/allowance';
import { boostsSlice, BoostsState } from '../../data/reducers/boosts';
import { dataLoaderSlice, DataLoaderState } from '../../data/reducers/data-loader';
import { walletSlice, WalletState } from '../../data/reducers/wallet';

// TODO: WIP we can organise reducers in different categories, define what makes sense later
export interface BeefyState {
  walletReducer: any;
  vaultReducer: any;
  pricesReducer: any;
  balanceReducer: any;
  entities: {
    chains: ChainsState;
    tokens: TokensState;
    vaults: VaultsState;
    boosts: BoostsState;
  };
  biz: {
    tvl: TvlState;
    apy: ApyState;
    historicalApy: HistoricalApyState;
  };
  user: {
    wallet: WalletState;
    balance: BalanceState;
    allowance: AllowanceState;
  };
  ui: {
    dataLoader: DataLoaderState;
  };
}

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
});
const userReducer = combineReducers<BeefyState['user']>({
  balance: balanceSlice.reducer,
  allowance: allowanceSlice.reducer,
  wallet: walletSlice.reducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  dataLoader: dataLoaderSlice.reducer,
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
