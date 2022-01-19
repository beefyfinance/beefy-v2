import { combineReducers, createStore } from 'redux';
import { allowanceSlice, AllowanceState } from './reducers/allowance';
import { apySlice, ApyState } from './reducers/apy';
import { balanceSlice, BalanceState } from './reducers/balance';
import { boostsSlice, BoostsState } from './reducers/boosts';
import { chainsSlice, ChainsState } from './reducers/chains';
import { dataLoaderSlice, DataLoaderState } from './reducers/data-loader';
import { historicalApySlice, HistoricalApyState } from './reducers/historical-apy';
import { tokenPriceSlice, TokenPriceState } from './reducers/token-price';
import { tokensSlice, TokensState } from './reducers/tokens';
import { tvlSlice, TvlState } from './reducers/tvl';
import { vaultsSlice, VaultsState } from './reducers/vaults';

// TODO: WIP we can organise reducers in different categories, define what makes sense later
export interface BeefyState {
  entities: {
    chains: ChainsState;
    prices: TokenPriceState;
    vaults: VaultsState;
    tokens: TokensState;
    tvl: TvlState;
    apy: ApyState;
    historicalApy: HistoricalApyState;
    balance: BalanceState;
    allowance: AllowanceState;
    boosts: BoostsState;
  };

  ui: {
    dataLoader: DataLoaderState;
  };
}

const entitiesReducer = combineReducers<BeefyState['entities']>({
  chains: chainsSlice.reducer,
  prices: tokenPriceSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
  historicalApy: historicalApySlice.reducer,
  balance: balanceSlice.reducer,
  allowance: allowanceSlice.reducer,
  boosts: boostsSlice.reducer,
});
const uiReducer = combineReducers<BeefyState['ui']>({
  dataLoader: dataLoaderSlice.reducer,
});
export const dataReducer = combineReducers<BeefyState>({
  entities: entitiesReducer,
  ui: uiReducer,
});
