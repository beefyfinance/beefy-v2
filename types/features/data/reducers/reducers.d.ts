import type { Reducer } from '@reduxjs/toolkit';
import type { WalletActionsState } from './wallet/wallet-action-types';
export declare const rootReducer: Reducer<{
    entities: {
        articles: import("./articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
        bridges: import("./bridges-types").BridgesState;
        chains: import("./chains-types").ChainsState;
        curators: import("./curators").CuratorsState;
        featuredVaults: import("./featured-vaults-types").FeaturedVaultsState;
        fees: import("./fees-types").FeesState;
        minters: import("./minters-types").MintersState;
        platforms: import("./platforms").PlatformsState;
        points: import("./points-types").PointsState;
        promos: import("./promos-types").PromosState;
        proposals: import("./proposals-types").ProposalsState;
        tokens: import("./tokens-types").TokensState;
        vaults: import("./vaults-types").VaultsState;
        zaps: import("./zaps-types").ZapsState;
    };
    biz: {
        apy: import("./apy-types").ApyState;
        historical: import("./historical-types").HistoricalState;
        partners: import("./partners-types").PartnersState;
        rewards: import("./rewards-types").RewardsState;
        tvl: import("./tvl-types").TvlState;
    };
    user: {
        allowance: import("./wallet/allowance-types").AllowanceState;
        analytics: import("./analytics-types").AnalyticsState;
        balance: import("./wallet/balance-types").BalanceState;
        migration: import("./wallet/migration-types").MigrationState;
        resolver: import("./wallet/resolver-types").ResolverState;
        rewards: import("./wallet/user-rewards-types").UserRewardsState;
        wallet: import("./wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
        walletActions: WalletActionsState;
    };
    ui: {
        addToWallet: import("./add-to-wallet-types").AddToWalletState;
        bridge: import("./wallet/bridge-types").BridgeState;
        dataLoader: import("./data-loader-types").DataLoaderState;
        filteredVaults: import("./filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        savedVaults: import("./saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        stepperState: import("./wallet/stepper-types").StepperState;
        tenderly: never;
        transact: import("./wallet/transact-types").TransactState;
        treasury: import("./treasury-types").TreasuryState;
        vaultsList: import("./vaults-list-types").VaultsListState;
        version: {
            updateAvailable: false;
        } | ({
            updateAvailable: true;
        } & import("./ui-version-types").NewVersionAvailable);
        revenue: import("./revenue").RevenueState;
        window: import("./window").WindowState;
    };
}, import("redux").UnknownAction, Partial<{
    entities: {
        articles: import("./articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
        bridges: import("./bridges-types").BridgesState;
        chains: import("./chains-types").ChainsState;
        curators: import("./curators").CuratorsState;
        featuredVaults: import("./featured-vaults-types").FeaturedVaultsState;
        fees: import("./fees-types").FeesState;
        minters: import("./minters-types").MintersState;
        platforms: import("./platforms").PlatformsState;
        points: import("./points-types").PointsState;
        promos: import("./promos-types").PromosState;
        proposals: import("./proposals-types").ProposalsState;
        tokens: import("./tokens-types").TokensState;
        vaults: import("./vaults-types").VaultsState;
        zaps: import("./zaps-types").ZapsState;
    } | Partial<{
        articles: (import("./articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
        bridges: import("./bridges-types").BridgesState | undefined;
        chains: import("./chains-types").ChainsState | undefined;
        curators: import("./curators").CuratorsState | undefined;
        featuredVaults: import("./featured-vaults-types").FeaturedVaultsState | undefined;
        fees: import("./fees-types").FeesState | undefined;
        minters: import("./minters-types").MintersState | undefined;
        platforms: import("./platforms").PlatformsState | undefined;
        points: import("./points-types").PointsState | undefined;
        promos: import("./promos-types").PromosState | undefined;
        proposals: import("./proposals-types").ProposalsState | undefined;
        tokens: import("./tokens-types").TokensState | undefined;
        vaults: import("./vaults-types").VaultsState | undefined;
        zaps: import("./zaps-types").ZapsState | undefined;
    }> | undefined;
    biz: {
        apy: import("./apy-types").ApyState;
        historical: import("./historical-types").HistoricalState;
        partners: import("./partners-types").PartnersState;
        rewards: import("./rewards-types").RewardsState;
        tvl: import("./tvl-types").TvlState;
    } | Partial<{
        apy: import("./apy-types").ApyState | undefined;
        historical: import("./historical-types").HistoricalState | undefined;
        partners: import("./partners-types").PartnersState | undefined;
        rewards: import("./rewards-types").RewardsState | undefined;
        tvl: import("./tvl-types").TvlState | undefined;
    }> | undefined;
    user: {
        allowance: import("./wallet/allowance-types").AllowanceState;
        analytics: import("./analytics-types").AnalyticsState;
        balance: import("./wallet/balance-types").BalanceState;
        migration: import("./wallet/migration-types").MigrationState;
        resolver: import("./wallet/resolver-types").ResolverState;
        rewards: import("./wallet/user-rewards-types").UserRewardsState;
        wallet: import("./wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
        walletActions: WalletActionsState;
    } | Partial<{
        allowance: import("./wallet/allowance-types").AllowanceState | undefined;
        analytics: import("./analytics-types").AnalyticsState | undefined;
        balance: import("./wallet/balance-types").BalanceState | undefined;
        migration: import("./wallet/migration-types").MigrationState | undefined;
        resolver: import("./wallet/resolver-types").ResolverState | undefined;
        rewards: import("./wallet/user-rewards-types").UserRewardsState | undefined;
        wallet: (import("./wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
        walletActions: WalletActionsState | undefined;
    }> | undefined;
    ui: {
        addToWallet: import("./add-to-wallet-types").AddToWalletState;
        bridge: import("./wallet/bridge-types").BridgeState;
        dataLoader: import("./data-loader-types").DataLoaderState;
        filteredVaults: import("./filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        savedVaults: import("./saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        stepperState: import("./wallet/stepper-types").StepperState;
        tenderly: never;
        transact: import("./wallet/transact-types").TransactState;
        treasury: import("./treasury-types").TreasuryState;
        vaultsList: import("./vaults-list-types").VaultsListState;
        version: {
            updateAvailable: false;
        } | ({
            updateAvailable: true;
        } & import("./ui-version-types").NewVersionAvailable);
        revenue: import("./revenue").RevenueState;
        window: import("./window").WindowState;
    } | Partial<{
        addToWallet: import("./add-to-wallet-types").AddToWalletState | undefined;
        bridge: import("./wallet/bridge-types").BridgeState | undefined;
        dataLoader: import("./data-loader-types").DataLoaderState | undefined;
        filteredVaults: (import("./filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
        savedVaults: (import("./saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial) | undefined;
        stepperState: import("./wallet/stepper-types").StepperState | undefined;
        tenderly: never;
        transact: import("./wallet/transact-types").TransactState | undefined;
        treasury: import("./treasury-types").TreasuryState | undefined;
        vaultsList: import("./vaults-list-types").VaultsListState | undefined;
        version: {
            updateAvailable: false;
        } | ({
            updateAvailable: true;
        } & import("./ui-version-types").NewVersionAvailable) | undefined;
        revenue: import("./revenue").RevenueState | undefined;
        window: import("./window").WindowState | undefined;
    }> | undefined;
}>>;
