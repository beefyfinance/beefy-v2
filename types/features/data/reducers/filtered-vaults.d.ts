import { type PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { FilterContent, type FilteredVaultBigNumberKeys, type FilteredVaultBooleanKeys, type FilteredVaultsState, type SetSubSortPayload } from './filtered-vaults-types';
export declare const filteredVaultsSlice: import("@reduxjs/toolkit").Slice<FilteredVaultsState, {
    reset(sliceState: import("immer").WritableDraft<FilteredVaultsState>): {
        filteredVaultIds: string[];
        sortedFilteredVaultIds: string[];
        reseted: boolean;
        sort: import("./filtered-vaults-types").SortType;
        subSort: import("./filtered-vaults-types").SubSortsState;
        sortDirection: import("./filtered-vaults-types").SortDirectionType;
        vaultCategory: import("./filtered-vaults-types").VaultCategoryType[];
        userCategory: import("./filtered-vaults-types").UserCategoryType;
        strategyType: import("./filtered-vaults-types").StrategiesType;
        assetType: import("./filtered-vaults-types").VaultAssetType[];
        searchText: string;
        chainIds: import("../entities/chain").ChainEntity["id"][];
        platformIds: import("../entities/platform").PlatformEntity["id"][];
        onlyRetired: boolean;
        onlyPaused: boolean;
        onlyBoosted: boolean;
        onlyZappable: boolean;
        onlyEarningPoints: boolean;
        onlyUnstakedClm: boolean;
        minimumUnderlyingTvl: BigNumber;
        filterContent: FilterContent;
    };
    setSort(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["sort"]>): void;
    setSubSort(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<SetSubSortPayload>): void;
    setSortDirection(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["sortDirection"]>): void;
    setSortFieldAndDirection(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
        field: FilteredVaultsState["sort"];
        direction: FilteredVaultsState["sortDirection"];
    }>): void;
    setVaultCategory(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["vaultCategory"]>): void;
    setStrategyType(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["strategyType"]>): void;
    setUserCategory(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["userCategory"]>): void;
    setAssetType(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["assetType"]>): void;
    setSearchText(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["searchText"]>): void;
    setChainIds(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["chainIds"]>): void;
    setPlatformIds(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["platformIds"]>): void;
    setFilterContent(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["filterContent"]>): void;
    setBoolean(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
        filter: FilteredVaultBooleanKeys;
        value: boolean;
    }>): void;
    setBigNumber: {
        reducer(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
            filter: FilteredVaultBigNumberKeys;
            value: BigNumber;
        }>): void;
        prepare: (payload: {
            filter: FilteredVaultBigNumberKeys;
            value: BigNumber;
        }) => {
            payload: {
                filter: FilteredVaultBigNumberKeys;
                value: BigNumber;
            };
            meta: unknown;
        };
    };
}, "filtered-vaults", "filtered-vaults", import("@reduxjs/toolkit").SliceSelectors<FilteredVaultsState>>;
export declare const filteredVaultsActions: import("@reduxjs/toolkit").CaseReducerActions<{
    reset(sliceState: import("immer").WritableDraft<FilteredVaultsState>): {
        filteredVaultIds: string[];
        sortedFilteredVaultIds: string[];
        reseted: boolean;
        sort: import("./filtered-vaults-types").SortType;
        subSort: import("./filtered-vaults-types").SubSortsState;
        sortDirection: import("./filtered-vaults-types").SortDirectionType;
        vaultCategory: import("./filtered-vaults-types").VaultCategoryType[];
        userCategory: import("./filtered-vaults-types").UserCategoryType;
        strategyType: import("./filtered-vaults-types").StrategiesType;
        assetType: import("./filtered-vaults-types").VaultAssetType[];
        searchText: string;
        chainIds: import("../entities/chain").ChainEntity["id"][];
        platformIds: import("../entities/platform").PlatformEntity["id"][];
        onlyRetired: boolean;
        onlyPaused: boolean;
        onlyBoosted: boolean;
        onlyZappable: boolean;
        onlyEarningPoints: boolean;
        onlyUnstakedClm: boolean;
        minimumUnderlyingTvl: BigNumber;
        filterContent: FilterContent;
    };
    setSort(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["sort"]>): void;
    setSubSort(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<SetSubSortPayload>): void;
    setSortDirection(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["sortDirection"]>): void;
    setSortFieldAndDirection(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
        field: FilteredVaultsState["sort"];
        direction: FilteredVaultsState["sortDirection"];
    }>): void;
    setVaultCategory(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["vaultCategory"]>): void;
    setStrategyType(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["strategyType"]>): void;
    setUserCategory(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["userCategory"]>): void;
    setAssetType(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["assetType"]>): void;
    setSearchText(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["searchText"]>): void;
    setChainIds(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["chainIds"]>): void;
    setPlatformIds(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["platformIds"]>): void;
    setFilterContent(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<FilteredVaultsState["filterContent"]>): void;
    setBoolean(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
        filter: FilteredVaultBooleanKeys;
        value: boolean;
    }>): void;
    setBigNumber: {
        reducer(sliceState: import("immer").WritableDraft<FilteredVaultsState>, action: PayloadAction<{
            filter: FilteredVaultBigNumberKeys;
            value: BigNumber;
        }>): void;
        prepare: (payload: {
            filter: FilteredVaultBigNumberKeys;
            value: BigNumber;
        }) => {
            payload: {
                filter: FilteredVaultBigNumberKeys;
                value: BigNumber;
            };
            meta: unknown;
        };
    };
}, "filtered-vaults">;
export declare const bigNumberTransform: import("redux-persist/es/types").Transform<BigNumber, string, any, any>;
