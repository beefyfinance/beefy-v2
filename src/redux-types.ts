import type { AnyAction, CombinedState, EnhancedStore, MiddlewareArray } from '@reduxjs/toolkit';
import type { ThunkAction, ThunkMiddleware } from 'redux-thunk';
import type { ApyState } from './features/data/reducers/apy';
import type { BoostsState } from './features/data/reducers/boosts';
import type { BuybackState } from './features/data/reducers/buyback';
import type { ChainsState } from './features/data/reducers/chains';
import type { FilteredVaultsState } from './features/data/reducers/filtered-vaults';
import type { PartnersState } from './features/data/reducers/partners';
import type { PlatformsState } from './features/data/reducers/platforms';
import type { TokensState } from './features/data/reducers/tokens';
import type { TvlState } from './features/data/reducers/tvl';
import type { UIThemeState } from './features/data/reducers/ui-theme';
import type { VaultsState } from './features/data/reducers/vaults';
import type { WalletState } from './features/data/reducers/wallet/wallet';
import type { AllowanceState } from './features/data/reducers/wallet/allowance';
import type { BalanceState } from './features/data/reducers/wallet/balance';
import type { WalletActionsState } from './features/data/reducers/wallet/wallet-action';
import type { ZapsState } from './features/data/reducers/zaps';
import type { BoostState } from './features/data/reducers/wallet/boost';
import type { MintersState } from './features/data/reducers/minters';
import type { Action } from 'redux';
import type { InfoCardsState } from './features/data/reducers/info-cards';
import type { BridgeState } from './features/data/reducers/wallet/bridge';
import type { OnRampTypes } from './features/data/reducers/on-ramp-types';
import type { DataLoaderState } from './features/data/reducers/data-loader-types';
import type { FeesState } from './features/data/reducers/fees';
import type { StepperState } from './features/data/reducers/wallet/stepper';
import type { TransactState } from './features/data/reducers/wallet/transact-types';
import type { AmmsState } from './features/data/reducers/amms';
import type { TreasuryState } from './features/data/reducers/treasury';
import type { AnalyticsState } from './features/data/reducers/analytics';
import type { ProposalsState } from './features/data/reducers/proposals';
import type { HistoricalState } from './features/data/reducers/historical-types';
import type { SavedVaultsState } from './features/data/reducers/saved-vaults';
import type { ResolverState } from './features/data/reducers/wallet/resolver-types';
import type { BridgesState } from './features/data/reducers/bridges';
import type { MigrationState } from './features/data/reducers/wallet/migration';
import type { TooltipsState } from './features/data/reducers/tooltips';

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
    proposals: ProposalsState;
    bridges: BridgesState;
  };
  biz: {
    tvl: TvlState;
    apy: ApyState;
    buyback: BuybackState;
    partners: PartnersState;
    historical: HistoricalState;
  };
  user: {
    allowance: AllowanceState;
    analytics: AnalyticsState;
    balance: BalanceState;
    resolver: ResolverState;
    wallet: WalletState;
    walletActions: WalletActionsState;
    migration: MigrationState;
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
    savedVaults: SavedVaultsState;
    tooltips: TooltipsState;
  };
}

export type BeefyStore = EnhancedStore<
  CombinedState<BeefyState>,
  AnyAction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MiddlewareArray<[ThunkMiddleware<CombinedState<BeefyState>, AnyAction, undefined>, ...any[]]>
>;

export type BeefyThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  BeefyState,
  unknown,
  Action<string>
>;
