import type { ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import type { UnknownAction } from 'redux';
import type { AddToWalletState } from '../reducers/add-to-wallet-types.ts';
import type { AnalyticsState } from '../reducers/analytics-types.ts';
import type { ApyState } from '../reducers/apy-types.ts';
import type { ArticlesState } from '../reducers/articles-types.ts';
import type { BridgesState } from '../reducers/bridges-types.ts';
import type { BeGemsState } from '../reducers/campaigns/begems-types.ts';
import type { ChainsState } from '../reducers/chains-types.ts';
import type { DataLoaderState } from '../reducers/data-loader-types.ts';
import type { FeesState } from '../reducers/fees-types.ts';
import type { FilteredVaultsState } from '../reducers/filtered-vaults-types.ts';
import type { HistoricalState } from '../reducers/historical-types.ts';
import type { MintersState } from '../reducers/minters-types.ts';
import type { OnRampTypes } from '../reducers/on-ramp-types.ts';
import type { PartnersState } from '../reducers/partners-types.ts';
import type { PlatformsState } from '../reducers/platforms.ts';
import type { PromosState } from '../reducers/promos-types.ts';
import type { ProposalsState } from '../reducers/proposals-types.ts';
import type { RewardsState } from '../reducers/rewards-types.ts';
import type { SavedVaultsState } from '../reducers/saved-vaults-type.ts';
import type { TenderlyState } from '../reducers/tenderly-types.ts';
import type { TokensState } from '../reducers/tokens-types.ts';
import type { TreasuryState } from '../reducers/treasury-types.ts';
import type { TvlState } from '../reducers/tvl-types.ts';
import type { VersionState } from '../reducers/ui-version-types.ts';
import type { VaultsListState } from '../reducers/vaults-list-types.ts';
import type { VaultsState } from '../reducers/vaults-types.ts';
import type { AllowanceState } from '../reducers/wallet/allowance-types.ts';
import type { BalanceState } from '../reducers/wallet/balance-types.ts';
import type { BridgeState } from '../reducers/wallet/bridge-types.ts';
import type { MigrationState } from '../reducers/wallet/migration-types.ts';
import type { ResolverState } from '../reducers/wallet/resolver-types.ts';
import type { StepperState } from '../reducers/wallet/stepper-types.ts';
import type { TransactState } from '../reducers/wallet/transact-types.ts';
import type { UserRewardsState } from '../reducers/wallet/user-rewards-types.ts';
import type { WalletActionsState } from '../reducers/wallet/wallet-action-types.ts';
import type { WalletState } from '../reducers/wallet/wallet-types.ts';
import type { ZapsState } from '../reducers/zaps-types.ts';

export interface BeefyState {
  entities: {
    articles: ArticlesState;
    bridges: BridgesState;
    chains: ChainsState;
    fees: FeesState;
    minters: MintersState;
    platforms: PlatformsState;
    promos: PromosState;
    proposals: ProposalsState;
    tokens: TokensState;
    vaults: VaultsState;
    zaps: ZapsState;
  };
  biz: {
    apy: ApyState;
    historical: HistoricalState;
    partners: PartnersState;
    rewards: RewardsState;
    tvl: TvlState;
  };
  user: {
    allowance: AllowanceState;
    analytics: AnalyticsState;
    balance: BalanceState;
    migration: MigrationState;
    resolver: ResolverState;
    rewards: UserRewardsState;
    wallet: WalletState;
    walletActions: WalletActionsState;
  };
  ui: {
    addToWallet: AddToWalletState;
    bridge: BridgeState;
    dataLoader: DataLoaderState;
    filteredVaults: FilteredVaultsState;
    onRamp: OnRampTypes;
    savedVaults: SavedVaultsState;
    stepperState: StepperState;
    tenderly?: TenderlyState | undefined;
    transact: TransactState;
    treasury: TreasuryState;
    vaultsList: VaultsListState;
    version: VersionState;
    campaigns: {
      begems: BeGemsState;
    };
  };
}

export type BeefyStateFn = () => BeefyState;

type BeefyThunkExtraArg = unknown;

export type BeefyDispatchFn = ThunkDispatch<BeefyState, BeefyThunkExtraArg, UnknownAction>;

export type BeefyThunk<ReturnType = unknown> = ThunkAction<
  ReturnType,
  BeefyState,
  BeefyThunkExtraArg,
  UnknownAction
>;

export type BeefyThunkConfig = {
  state: BeefyState;
  dispatch: BeefyDispatchFn;
};

export type BeefyMetaThunkConfig<T> = BeefyThunkConfig & {
  pendingMeta: T;
  fulfilledMeta: T;
  rejectedMeta: T;
};
