import { filteredVaultsActions } from "../features/data/reducers/filtered-vaults";
import { selectFilterBoolean, selectFilterPlatformId, selectFilterSearchSortDirection, selectFilterSearchSortField, selectFilterSearchText, selectFilterUserCategory, selectFilterVaultCategory, selectFilterVaultType } from "../features/data/selectors/filtered-vaults";
import { useSyncedVaultBoolKey } from "./useSyncedVaultBoolKey";
import { useSyncedVaultChains } from "./useSyncedVaultChains";
import { useSyncedVaultStringKey } from "./useSyncedVaultStringKey";

/**
 * It syncs the URL with the Redux store, and vice versa for the Vault Filters
 * @returns Nothing.
 */
export const useSyncedVaultFilters = () => {
    // Vaults Type
    useSyncedVaultStringKey({
        key: "type",
        reduxAction: filteredVaultsActions.setVaultType,
        selector: selectFilterVaultType,
        validationFunction: function(proposedValue:string) {
            return ["all", "lps", "single"].includes(proposedValue);
        },
        defaultValue: "all"
    });

    // Vaults Sort
    useSyncedVaultStringKey({
        key: "sort",
        reduxAction: filteredVaultsActions.setSort,
        selector: selectFilterSearchSortField,
        validationFunction: function(proposedValue:string) {
            return ["tvl", "apy", "daily", "safetyScore", "default", "depositValue", "walletValue"].includes(proposedValue);
        },
        defaultValue: "default"
    });

    // Vaults Sort Direction
    useSyncedVaultStringKey({
        key: "sortDirection",
        reduxAction: filteredVaultsActions.setSortDirection,
        selector: selectFilterSearchSortDirection,
        validationFunction: function(proposedValue:string) {
            return ["asc", "desc"].includes(proposedValue);
        },
        defaultValue: "desc"
    });

    // Vaults Vault Category
    useSyncedVaultStringKey({
        key: "vaultCategory",
        reduxAction: filteredVaultsActions.setVaultCategory,
        selector: selectFilterVaultCategory,
        validationFunction: function(proposedValue:string) {
            return ["all", "featured", "stable", "bluechip", "beefy"].includes(proposedValue);
        },
        defaultValue: "all"
    });

    // Vaults User Category
    useSyncedVaultStringKey({
        key: "userCategory",
        reduxAction: filteredVaultsActions.setUserCategory,
        selector: selectFilterUserCategory,
        validationFunction: function(proposedValue:string) {
            return ["all", "eligible", "deposited"].includes(proposedValue);
        },
        defaultValue: "all"
    });

    // Vaults Search Text
    useSyncedVaultStringKey({
        key: "searchText",
        reduxAction: filteredVaultsActions.setSearchText,
        selector: selectFilterSearchText,
        validationFunction: function() {
            return true; // Any text is valid in the search field! (for now)
        }
    });

    // Vaults Chain IDs
    useSyncedVaultChains({
        key: "chains",
    });

    // Vaults Only Retired
    useSyncedVaultBoolKey({
        key: "onlyRetired",
        reduxAction: filteredVaultsActions.setOnlyRetired,
        selector: state => selectFilterBoolean(state, "onlyRetired")
    });

    // Vaults Only Paused
    useSyncedVaultBoolKey({
        key: "onlyPaused",
        reduxAction: filteredVaultsActions.setOnlyPaused,
        selector: state => selectFilterBoolean(state, "onlyPaused")
    });

    // Vaults Only Boosted
    useSyncedVaultBoolKey({
        key: "onlyBoosted",
        reduxAction: filteredVaultsActions.setOnlyBoosted,
        selector: state => selectFilterBoolean(state, "onlyBoosted")
    });

    useSyncedVaultStringKey({
        key: "platform",
        reduxAction: filteredVaultsActions.setPlatformId,
        selector: selectFilterPlatformId,
        validationFunction: function () {
            return true; // TODO: In the future, probably we want to check if it is a valid platform entity,
            // in case the user build the URL by themselves. 
            // Since that is not that common, I have avoided coding that, but we should!
        }
    })
}