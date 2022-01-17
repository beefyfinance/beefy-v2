import { combineReducers, createStore } from 'redux';
import { apySlice, ApyState } from './reducers/apy';
import { dataLoaderSlice, DataLoaderState } from './reducers/data-loader';
import { tokenPriceSlice, TokenPriceState } from './reducers/token-price';
import { tokensSlice, TokensState } from './reducers/tokens';
import { tvlSlice, TvlState } from './reducers/tvl';
import { vaultsSlice, VaultsState } from './reducers/vaults';

// TODO: WIP we can organise reducers in different categories, define what makes sense later
export interface BeefyState {
  entities: {
    prices: TokenPriceState;
    vaults: VaultsState;
    tokens: TokensState;
    tvl: TvlState;
    apy: ApyState;
  };
  ui: {
    dataLoader: DataLoaderState;
  };
}

const entitiesReducer = combineReducers({
  prices: tokenPriceSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
  tvl: tvlSlice.reducer,
  apy: apySlice.reducer,
});
const uiReducer = combineReducers({
  dataLoader: dataLoaderSlice.reducer,
});
export const dataReducer = combineReducers({
  entities: entitiesReducer,
  ui: uiReducer,
});
