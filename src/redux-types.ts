import type {
  AnyAction,
  CombinedState,
  EnhancedStore,
  MiddlewareArray,
  ThunkAction,
  ThunkDispatch,
  ThunkMiddleware,
} from '@reduxjs/toolkit';
import type { ApyState } from './features/data/reducers/apy';
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
import type { MintersState } from './features/data/reducers/minters';
import type { Action } from 'redux';
import type { BridgeState } from './features/data/reducers/wallet/bridge';
import type { OnRampTypes } from './features/data/reducers/on-ramp-types';
import type { DataLoaderState } from './features/data/reducers/data-loader-types';
import type { FeesState } from './features/data/reducers/fees';
import type { StepperState } from './features/data/reducers/wallet/stepper';
import type { TransactState } from './features/data/reducers/wallet/transact-types';
import type { TreasuryState } from './features/data/reducers/treasury';
import type { ProposalsState } from './features/data/reducers/proposals';
import type { HistoricalState } from './features/data/reducers/historical-types';
import type { SavedVaultsState } from './features/data/reducers/saved-vaults';
import type { ResolverState } from './features/data/reducers/wallet/resolver-types';
import type { BridgesState } from './features/data/reducers/bridges';
import type { MigrationState } from './features/data/reducers/wallet/migration';
import type { TooltipsState } from './features/data/reducers/tooltips';
import type { AddToWalletState } from './features/data/reducers/add-to-wallet';
import type { ArticlesState } from './features/data/reducers/articles';
import type { UserRewardsState } from './features/data/reducers/wallet/user-rewards-types';
import type { VersionState } from './features/data/reducers/ui-version';
import type { TenderlyState } from './features/data/reducers/tenderly-types';
import type { AnalyticsState } from './features/data/reducers/analytics-types';
import type { RewardsState } from './features/data/reducers/rewards-types';
import type { PromosState } from './features/data/reducers/promos';

export interface BeefyState {
  entities: {
    chains: ChainsState;
    tokens: TokensState;
    vaults: VaultsState;
    promos: PromosState;
    fees: FeesState;
    platforms: PlatformsState;
    zaps: ZapsState;
    minters: MintersState;
    proposals: ProposalsState;
    bridges: BridgesState;
    articles: ArticlesState;
  };
  biz: {
    tvl: TvlState;
    apy: ApyState;
    partners: PartnersState;
    historical: HistoricalState;
    rewards: RewardsState;
  };
  user: {
    allowance: AllowanceState;
    analytics: AnalyticsState;
    balance: BalanceState;
    resolver: ResolverState;
    wallet: WalletState;
    walletActions: WalletActionsState;
    migration: MigrationState;
    rewards: UserRewardsState;
  };
  ui: {
    dataLoader: DataLoaderState;
    filteredVaults: FilteredVaultsState;
    theme: UIThemeState;
    transact: TransactState;
    bridge: BridgeState;
    onRamp: OnRampTypes;
    stepperState: StepperState;
    treasury: TreasuryState;
    savedVaults: SavedVaultsState;
    tooltips: TooltipsState;
    addToWallet: AddToWalletState;
    version: VersionState;
    tenderly?: TenderlyState;
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

export type BeefyStateFn = () => BeefyState;

export type BeefyDispatchFn = ThunkDispatch<BeefyState, unknown, AnyAction>;

export type BeefyThunkConfig = {
  state: BeefyState;
  dispatch: BeefyDispatchFn;
};

export type BeefyMetaThunkConfig<T> = BeefyThunkConfig & {
  pendingMeta: T;
  fulfilledMeta: T;
  rejectedMeta: T;
};
