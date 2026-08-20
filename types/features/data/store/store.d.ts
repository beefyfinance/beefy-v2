export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    entities: {
        articles: import("../reducers/articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
        bridges: import("../reducers/bridges-types").BridgesState;
        chains: import("../reducers/chains-types").ChainsState;
        curators: import("../reducers/curators").CuratorsState;
        featuredVaults: import("../reducers/featured-vaults-types").FeaturedVaultsState;
        fees: import("../reducers/fees-types").FeesState;
        minters: import("../reducers/minters-types").MintersState;
        platforms: import("../reducers/platforms").PlatformsState;
        points: import("../reducers/points-types").PointsState;
        promos: import("../reducers/promos-types").PromosState;
        proposals: import("../reducers/proposals-types").ProposalsState;
        tokens: import("../reducers/tokens-types").TokensState;
        vaults: import("../reducers/vaults-types").VaultsState;
        zaps: import("../reducers/zaps-types").ZapsState;
    };
    biz: {
        apy: import("../reducers/apy-types").ApyState;
        historical: import("../reducers/historical-types").HistoricalState;
        partners: import("../reducers/partners-types").PartnersState;
        rewards: import("../reducers/rewards-types").RewardsState;
        tvl: import("../reducers/tvl-types").TvlState;
    };
    user: {
        allowance: import("../reducers/wallet/allowance-types").AllowanceState;
        analytics: import("../reducers/analytics-types").AnalyticsState;
        balance: import("../reducers/wallet/balance-types").BalanceState;
        migration: import("../reducers/wallet/migration-types").MigrationState;
        resolver: import("../reducers/wallet/resolver-types").ResolverState;
        rewards: import("../reducers/wallet/user-rewards-types").UserRewardsState;
        wallet: import("../reducers/wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
        walletActions: import("../reducers/wallet/wallet-action-types").WalletActionsState;
    };
    ui: {
        addToWallet: import("../reducers/add-to-wallet-types").AddToWalletState;
        bridge: import("../reducers/wallet/bridge-types").BridgeState;
        dataLoader: import("../reducers/data-loader-types").DataLoaderState;
        filteredVaults: import("../reducers/filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        savedVaults: import("../reducers/saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        stepperState: import("../reducers/wallet/stepper-types").StepperState;
        tenderly: never;
        transact: import("../reducers/wallet/transact-types").TransactState;
        treasury: import("../reducers/treasury-types").TreasuryState;
        vaultsList: import("../reducers/vaults-list-types").VaultsListState;
        version: {
            updateAvailable: false;
        } | ({
            updateAvailable: true;
        } & import("../reducers/ui-version-types").NewVersionAvailable);
        revenue: import("../reducers/revenue").RevenueState;
        window: import("../reducers/window").WindowState;
    };
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: ((action: import("redux").Action<"listenerMiddleware/add">) => import("@reduxjs/toolkit").UnsubscribeListener) & import("redux-thunk").ThunkDispatch<{
        entities: {
            articles: import("../reducers/articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
            bridges: import("../reducers/bridges-types").BridgesState;
            chains: import("../reducers/chains-types").ChainsState;
            curators: import("../reducers/curators").CuratorsState;
            featuredVaults: import("../reducers/featured-vaults-types").FeaturedVaultsState;
            fees: import("../reducers/fees-types").FeesState;
            minters: import("../reducers/minters-types").MintersState;
            platforms: import("../reducers/platforms").PlatformsState;
            points: import("../reducers/points-types").PointsState;
            promos: import("../reducers/promos-types").PromosState;
            proposals: import("../reducers/proposals-types").ProposalsState;
            tokens: import("../reducers/tokens-types").TokensState;
            vaults: import("../reducers/vaults-types").VaultsState;
            zaps: import("../reducers/zaps-types").ZapsState;
        };
        biz: {
            apy: import("../reducers/apy-types").ApyState;
            historical: import("../reducers/historical-types").HistoricalState;
            partners: import("../reducers/partners-types").PartnersState;
            rewards: import("../reducers/rewards-types").RewardsState;
            tvl: import("../reducers/tvl-types").TvlState;
        };
        user: {
            allowance: import("../reducers/wallet/allowance-types").AllowanceState;
            analytics: import("../reducers/analytics-types").AnalyticsState;
            balance: import("../reducers/wallet/balance-types").BalanceState;
            migration: import("../reducers/wallet/migration-types").MigrationState;
            resolver: import("../reducers/wallet/resolver-types").ResolverState;
            rewards: import("../reducers/wallet/user-rewards-types").UserRewardsState;
            wallet: import("../reducers/wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
            walletActions: import("../reducers/wallet/wallet-action-types").WalletActionsState;
        };
        ui: {
            addToWallet: import("../reducers/add-to-wallet-types").AddToWalletState;
            bridge: import("../reducers/wallet/bridge-types").BridgeState;
            dataLoader: import("../reducers/data-loader-types").DataLoaderState;
            filteredVaults: import("../reducers/filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
            savedVaults: import("../reducers/saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
            stepperState: import("../reducers/wallet/stepper-types").StepperState;
            tenderly: never;
            transact: import("../reducers/wallet/transact-types").TransactState;
            treasury: import("../reducers/treasury-types").TreasuryState;
            vaultsList: import("../reducers/vaults-list-types").VaultsListState;
            version: {
                updateAvailable: false;
            } | ({
                updateAvailable: true;
            } & import("../reducers/ui-version-types").NewVersionAvailable);
            revenue: import("../reducers/revenue").RevenueState;
            window: import("../reducers/window").WindowState;
        };
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export declare const persistor: import("redux-persist").Persistor;
/** @deprecated don't use the store directly */
export type BeefyStore = typeof store;
/** @deprecated don't use the store directly */
export declare const useAppStore: import("react-redux").UseStore<import("@reduxjs/toolkit").EnhancedStore<{
    entities: {
        articles: import("../reducers/articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
        bridges: import("../reducers/bridges-types").BridgesState;
        chains: import("../reducers/chains-types").ChainsState;
        curators: import("../reducers/curators").CuratorsState;
        featuredVaults: import("../reducers/featured-vaults-types").FeaturedVaultsState;
        fees: import("../reducers/fees-types").FeesState;
        minters: import("../reducers/minters-types").MintersState;
        platforms: import("../reducers/platforms").PlatformsState;
        points: import("../reducers/points-types").PointsState;
        promos: import("../reducers/promos-types").PromosState;
        proposals: import("../reducers/proposals-types").ProposalsState;
        tokens: import("../reducers/tokens-types").TokensState;
        vaults: import("../reducers/vaults-types").VaultsState;
        zaps: import("../reducers/zaps-types").ZapsState;
    };
    biz: {
        apy: import("../reducers/apy-types").ApyState;
        historical: import("../reducers/historical-types").HistoricalState;
        partners: import("../reducers/partners-types").PartnersState;
        rewards: import("../reducers/rewards-types").RewardsState;
        tvl: import("../reducers/tvl-types").TvlState;
    };
    user: {
        allowance: import("../reducers/wallet/allowance-types").AllowanceState;
        analytics: import("../reducers/analytics-types").AnalyticsState;
        balance: import("../reducers/wallet/balance-types").BalanceState;
        migration: import("../reducers/wallet/migration-types").MigrationState;
        resolver: import("../reducers/wallet/resolver-types").ResolverState;
        rewards: import("../reducers/wallet/user-rewards-types").UserRewardsState;
        wallet: import("../reducers/wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
        walletActions: import("../reducers/wallet/wallet-action-types").WalletActionsState;
    };
    ui: {
        addToWallet: import("../reducers/add-to-wallet-types").AddToWalletState;
        bridge: import("../reducers/wallet/bridge-types").BridgeState;
        dataLoader: import("../reducers/data-loader-types").DataLoaderState;
        filteredVaults: import("../reducers/filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        savedVaults: import("../reducers/saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
        stepperState: import("../reducers/wallet/stepper-types").StepperState;
        tenderly: never;
        transact: import("../reducers/wallet/transact-types").TransactState;
        treasury: import("../reducers/treasury-types").TreasuryState;
        vaultsList: import("../reducers/vaults-list-types").VaultsListState;
        version: {
            updateAvailable: false;
        } | ({
            updateAvailable: true;
        } & import("../reducers/ui-version-types").NewVersionAvailable);
        revenue: import("../reducers/revenue").RevenueState;
        window: import("../reducers/window").WindowState;
    };
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: ((action: import("redux").Action<"listenerMiddleware/add">) => import("@reduxjs/toolkit").UnsubscribeListener) & import("redux-thunk").ThunkDispatch<{
        entities: {
            articles: import("../reducers/articles-types").ArticlesState & import("redux-persist/es/persistReducer").PersistPartial;
            bridges: import("../reducers/bridges-types").BridgesState;
            chains: import("../reducers/chains-types").ChainsState;
            curators: import("../reducers/curators").CuratorsState;
            featuredVaults: import("../reducers/featured-vaults-types").FeaturedVaultsState;
            fees: import("../reducers/fees-types").FeesState;
            minters: import("../reducers/minters-types").MintersState;
            platforms: import("../reducers/platforms").PlatformsState;
            points: import("../reducers/points-types").PointsState;
            promos: import("../reducers/promos-types").PromosState;
            proposals: import("../reducers/proposals-types").ProposalsState;
            tokens: import("../reducers/tokens-types").TokensState;
            vaults: import("../reducers/vaults-types").VaultsState;
            zaps: import("../reducers/zaps-types").ZapsState;
        };
        biz: {
            apy: import("../reducers/apy-types").ApyState;
            historical: import("../reducers/historical-types").HistoricalState;
            partners: import("../reducers/partners-types").PartnersState;
            rewards: import("../reducers/rewards-types").RewardsState;
            tvl: import("../reducers/tvl-types").TvlState;
        };
        user: {
            allowance: import("../reducers/wallet/allowance-types").AllowanceState;
            analytics: import("../reducers/analytics-types").AnalyticsState;
            balance: import("../reducers/wallet/balance-types").BalanceState;
            migration: import("../reducers/wallet/migration-types").MigrationState;
            resolver: import("../reducers/wallet/resolver-types").ResolverState;
            rewards: import("../reducers/wallet/user-rewards-types").UserRewardsState;
            wallet: import("../reducers/wallet/wallet-types").WalletState & import("redux-persist/es/persistReducer").PersistPartial;
            walletActions: import("../reducers/wallet/wallet-action-types").WalletActionsState;
        };
        ui: {
            addToWallet: import("../reducers/add-to-wallet-types").AddToWalletState;
            bridge: import("../reducers/wallet/bridge-types").BridgeState;
            dataLoader: import("../reducers/data-loader-types").DataLoaderState;
            filteredVaults: import("../reducers/filtered-vaults-types").FilteredVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
            savedVaults: import("../reducers/saved-vaults-type").SavedVaultsState & import("redux-persist/es/persistReducer").PersistPartial;
            stepperState: import("../reducers/wallet/stepper-types").StepperState;
            tenderly: never;
            transact: import("../reducers/wallet/transact-types").TransactState;
            treasury: import("../reducers/treasury-types").TreasuryState;
            vaultsList: import("../reducers/vaults-list-types").VaultsListState;
            version: {
                updateAvailable: false;
            } | ({
                updateAvailable: true;
            } & import("../reducers/ui-version-types").NewVersionAvailable);
            revenue: import("../reducers/revenue").RevenueState;
            window: import("../reducers/window").WindowState;
        };
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>>;
