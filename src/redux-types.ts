import type {
  AnyAction,
  CombinedState,
  EnhancedStore,
  MiddlewareArray,
  ThunkAction,
  ThunkDispatch,
  ThunkMiddleware,
} from '@reduxjs/toolkit';
import type { ApyState } from './features/data/reducers/apy.ts';
import type { ChainsState } from './features/data/reducers/chains.ts';
import type { FilteredVaultsState } from './features/data/reducers/filtered-vaults.ts';
import type { PartnersState } from './features/data/reducers/partners.ts';
import type { PlatformsState } from './features/data/reducers/platforms.ts';
import type { TokensState } from './features/data/reducers/tokens.ts';
import type { TvlState } from './features/data/reducers/tvl.ts';
import type { UIThemeState } from './features/data/reducers/ui-theme.ts';
import type { VaultsState } from './features/data/reducers/vaults.ts';
import type { WalletState } from './features/data/reducers/wallet/wallet.ts';
import type { AllowanceState } from './features/data/reducers/wallet/allowance.ts';
import type { BalanceState } from './features/data/reducers/wallet/balance.ts';
import type { WalletActionsState } from './features/data/reducers/wallet/wallet-action.ts';
import type { ZapsState } from './features/data/reducers/zaps.ts';
import type { MintersState } from './features/data/reducers/minters.ts';
import type { Action } from 'redux';
import type { BridgeState } from './features/data/reducers/wallet/bridge.ts';
import type { OnRampTypes } from './features/data/reducers/on-ramp-types.ts';
import type { DataLoaderState } from './features/data/reducers/data-loader-types.ts';
import type { FeesState } from './features/data/reducers/fees.ts';
import type { StepperState } from './features/data/reducers/wallet/stepper.ts';
import type { TransactState } from './features/data/reducers/wallet/transact-types.ts';
import type { TreasuryState } from './features/data/reducers/treasury.ts';
import type { ProposalsState } from './features/data/reducers/proposals.ts';
import type { HistoricalState } from './features/data/reducers/historical-types.ts';
import type { SavedVaultsState } from './features/data/reducers/saved-vaults.ts';
import type { ResolverState } from './features/data/reducers/wallet/resolver-types.ts';
import type { BridgesState } from './features/data/reducers/bridges.ts';
import type { MigrationState } from './features/data/reducers/wallet/migration.ts';
import type { AddToWalletState } from './features/data/reducers/add-to-wallet.ts';
import type { ArticlesState } from './features/data/reducers/articles.ts';
import type { UserRewardsState } from './features/data/reducers/wallet/user-rewards-types.ts';
import type { VersionState } from './features/data/reducers/ui-version.ts';
import type { TenderlyState } from './features/data/reducers/tenderly-types.ts';
import type { AnalyticsState } from './features/data/reducers/analytics-types.ts';
import type { RewardsState } from './features/data/reducers/rewards-types.ts';
import type { PromosState } from './features/data/reducers/promos.ts';

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

export type BeefyThunk<ReturnType = unknown> = ThunkAction<
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
