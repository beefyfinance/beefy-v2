import { EnhancedStore, CombinedState, MiddlewareArray, AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from '@reduxjs/toolkit/node_modules/redux-thunk';
import { AllowanceState } from './features/data/reducers/allowance';
import { ApyState } from './features/data/reducers/apy';
import { BalanceState } from './features/data/reducers/balance';
import { BoostsState } from './features/data/reducers/boosts';
import { BuybackState } from './features/data/reducers/buyback';
import { ChainsState } from './features/data/reducers/chains';
import { DataLoaderState } from './features/data/reducers/data-loader';
import { FilteredVaultsState } from './features/data/reducers/filtered-vaults';
import { HistoricalApyState } from './features/data/reducers/historical-apy';
import { PlatformsState } from './features/data/reducers/platforms';
import { TokensState } from './features/data/reducers/tokens';
import { TvlState } from './features/data/reducers/tvl';
import { VaultsState } from './features/data/reducers/vaults';
import { WalletState } from './features/data/reducers/wallet';

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
    platforms: PlatformsState;
  };
  biz: {
    tvl: TvlState;
    apy: ApyState;
    historicalApy: HistoricalApyState;
    buyback: BuybackState;
  };
  user: {
    wallet: WalletState;
    balance: BalanceState;
    allowance: AllowanceState;
  };
  ui: {
    dataLoader: DataLoaderState;
    filteredVaults: FilteredVaultsState;
  };
}

export type BeefyStore = EnhancedStore<
  CombinedState<BeefyState>,
  AnyAction,
  MiddlewareArray<
    | ((store: any) => (next: any) => (action: any) => any)
    | ThunkMiddleware<CombinedState<BeefyState>, AnyAction, null>
  >
>;
