import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain';
import type { PlatformEntity } from '../entities/platform';
import type { VaultEntity } from '../entities/vault';
import type { KeysOfType } from '../utils/types-utils';
export type SortType = 'tvl' | 'apy' | 'daily' | 'default' | 'depositValue';
export type SortDirectionType = 'asc' | 'desc';
export type VaultCategoryType = 'stable' | 'bluechip' | 'meme' | 'correlated';
export type VaultAssetType = 'lps' | 'single' | 'clm';
export type StrategiesType = 'all' | 'pools' | 'vaults';
export type UserCategoryType = 'all' | 'saved' | 'deposited';
export declare function isValidUserCategory(category: string): category is UserCategoryType;
export type AvgApySortType = 'default' | 7 | 30 | 90;
export type SubSortsState = {
    apy: AvgApySortType;
};
export type SortWithSubSort = keyof SubSortsState & SortType;
export declare enum FilterContent {
    Filter = 1,
    Platform = 2,
    Chains = 3
}
/**
 * State containing Vault infos
 * Increase the version on persistReducer if you make changes to this shape
 */
export type FilteredVaultsState = {
    /**
     * Some form element have local copies of the state as putting it inside the
     * redux store would be too slow for user interactions. This bool tells them
     * to reset their local copy. The search text is (for now) the only example.
     **/
    reseted: boolean;
    sort: SortType;
    subSort: SubSortsState;
    sortDirection: SortDirectionType;
    vaultCategory: VaultCategoryType[];
    userCategory: UserCategoryType;
    strategyType: StrategiesType;
    assetType: VaultAssetType[];
    searchText: string;
    chainIds: ChainEntity['id'][];
    platformIds: PlatformEntity['id'][];
    onlyRetired: boolean;
    onlyPaused: boolean;
    onlyBoosted: boolean;
    onlyZappable: boolean;
    onlyEarningPoints: boolean;
    onlyUnstakedClm: boolean;
    filteredVaultIds: VaultEntity['id'][];
    sortedFilteredVaultIds: VaultEntity['id'][];
    minimumUnderlyingTvl: BigNumber;
    filterContent: FilterContent;
};
export type FilteredVaultBooleanKeys = KeysOfType<Omit<FilteredVaultsState, 'reseted'>, boolean>;
export type FilteredVaultBigNumberKeys = KeysOfType<FilteredVaultsState, BigNumber>;
export type SetSubSortPayload<K extends SortWithSubSort = SortWithSubSort> = {
    [K in SortWithSubSort]: {
        column: K;
        value: SubSortsState[K];
    };
}[K];
