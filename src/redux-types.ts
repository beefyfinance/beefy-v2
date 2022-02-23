import { EnhancedStore, CombinedState, MiddlewareArray, AnyAction } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import { ThunkMiddleware } from 'redux-thunk';
import { ApyState } from './features/data/reducers/apy';
import { BoostsState } from './features/data/reducers/boosts';
import { BuybackState } from './features/data/reducers/buyback';
import { ChainsState } from './features/data/reducers/chains';
import { DataLoaderState } from './features/data/reducers/data-loader';
import { FilteredVaultsState } from './features/data/reducers/filtered-vaults';
import { PartnersState } from './features/data/reducers/partners';
import { PlatformsState } from './features/data/reducers/platforms';
import { TokensState } from './features/data/reducers/tokens';
import { TvlState } from './features/data/reducers/tvl';
import { UIThemeState } from './features/data/reducers/ui-theme';
import { VaultsState } from './features/data/reducers/vaults';
import { WalletState } from './features/data/reducers/wallet/wallet';
import { AllowanceState } from './features/data/reducers/wallet/allowance';
import { BalanceState } from './features/data/reducers/wallet/balance';
import { DepositState } from './features/data/reducers/wallet/deposit';
import { WalletActionsState } from './features/data/reducers/wallet/wallet-action';
import { ZapsState } from './features/data/reducers/zaps';
import { WithdrawState } from './features/data/reducers/wallet/withdraw';
import { BoostModalState } from './features/data/reducers/wallet/boost-modal';

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
    buyback: BuybackState;
    partners: PartnersState;
  };
  user: {
    wallet: WalletState;
    walletActions: WalletActionsState;
    balance: BalanceState;
    allowance: AllowanceState;
  };
  ui: {
    dataLoader: DataLoaderState;
    filteredVaults: FilteredVaultsState;
    theme: UIThemeState;
    deposit: DepositState;
    withdraw: WithdrawState;
    boostModal: BoostModalState;
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
