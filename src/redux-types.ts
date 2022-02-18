import { EnhancedStore, CombinedState, MiddlewareArray, AnyAction } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import { ThunkMiddleware } from 'redux-thunk';
import { AllowanceState } from './features/data/reducers/allowance';
import { ApyState } from './features/data/reducers/apy';
import { BalanceState } from './features/data/reducers/balance';
import { BoostsState } from './features/data/reducers/boosts';
import { BuybackState } from './features/data/reducers/buyback';
import { ChainsState } from './features/data/reducers/chains';
import { DataLoaderState } from './features/data/reducers/data-loader';
import { DepositState } from './features/data/reducers/deposit';
import { FilteredVaultsState } from './features/data/reducers/filtered-vaults';
import { HistoricalApyState } from './features/data/reducers/historical-apy';
import { PartnersState } from './features/data/reducers/partners';
import { PlatformsState } from './features/data/reducers/platforms';
import { TokensState } from './features/data/reducers/tokens';
import { TvlState } from './features/data/reducers/tvl';
import { UIThemeState } from './features/data/reducers/ui-theme';
import { VaultsState } from './features/data/reducers/vaults';
import { WalletState } from './features/data/reducers/wallet';
import { ZapsState } from './features/data/reducers/zaps';

export interface BeefyState {
  entities: {
    chains: ChainsState;
    tokens: TokensState;
    vaults: VaultsState;
    boosts: BoostsState;
    platforms: PlatformsState;
    zaps: ZapsState;
  };
  biz: {
    tvl: TvlState;
    apy: ApyState;
    historicalApy: HistoricalApyState;
    buyback: BuybackState;
    partners: PartnersState;
  };
  user: {
    wallet: WalletState;
    balance: BalanceState;
    allowance: AllowanceState;
  };
  ui: {
    dataLoader: DataLoaderState;
    filteredVaults: FilteredVaultsState;
    theme: UIThemeState;
    deposit: DepositState;
  };
}

export type BeefyStore = EnhancedStore<
  CombinedState<BeefyState>,
  AnyAction,
  MiddlewareArray<
    | ((store: any) => (next: any) => (action: any) => any)
    | ThunkMiddleware<CombinedState<BeefyState>, any, null>
  >
>;

export type BeefyDispatch = Dispatch<any>;
