import { AnyAction, CombinedState, EnhancedStore, MiddlewareArray } from '@reduxjs/toolkit';
import { ThunkAction, ThunkMiddleware } from 'redux-thunk';
import { ApyState } from './features/data/reducers/apy';
import { BoostsState } from './features/data/reducers/boosts';
import { BuybackState } from './features/data/reducers/buyback';
import { ChainsState } from './features/data/reducers/chains';
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
import { WalletActionsState } from './features/data/reducers/wallet/wallet-action';
import { ZapsState } from './features/data/reducers/zaps';
import { BoostState } from './features/data/reducers/wallet/boost';
import { MintersState } from './features/data/reducers/minters';
import { Action } from 'redux';
import { InfoCardsState } from './features/data/reducers/info-cards';
import { BridgeState } from './features/data/reducers/wallet/bridge';
import { OnRampTypes } from './features/data/reducers/on-ramp-types';
import { DataLoaderState } from './features/data/reducers/data-loader-types';
import { FeesState } from './features/data/reducers/fees';
import { StepperState } from './features/data/reducers/wallet/stepper';
import { TransactState } from './features/data/reducers/wallet/transact-types';
import { AmmsState } from './features/data/reducers/amms';
import { TreasuryState } from './features/data/reducers/treasury';

export interface BeefyState {
  entities: {
    chains: ChainsState;
    tokens: TokensState;
    vaults: VaultsState;
    boosts: BoostsState;
    fees: FeesState;
    platforms: PlatformsState;
    zaps: ZapsState;
    amms: AmmsState;
    minters: MintersState;
    infoCards: InfoCardsState;
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
    transact: TransactState;
    boost: BoostState;
    bridge: BridgeState;
    onRamp: OnRampTypes;
    stepperState: StepperState;
    treasury: TreasuryState;
  };
}

export type BeefyStore = EnhancedStore<
  CombinedState<BeefyState>,
  AnyAction,
  MiddlewareArray<[ThunkMiddleware<CombinedState<BeefyState>, AnyAction, undefined>, ...any[]]>
>;

export type BeefyThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  BeefyState,
  unknown,
  Action<string>
>;
