import { createSelector } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';
import { BeefyState } from '../../../redux-types';
import { isGovVaultApy, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { isVaultActive } from '../entities/vault';
import { selectHasUserDepositInVault, selectHasWalletBalanceOfToken } from './balance';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
  selectIsVaultMoonpot,
} from './boosts';
import {
  selectIsVaultBeefy,
  selectIsVaultBlueChip,
  selectIsVaultFeatured,
  selectIsVaultStable,
  selectVaultById,
} from './vaults';

export const selectFilterOptions = (state: BeefyState) => state.ui.filteredVaults;

export const selectFilterPopinFilterCount = createSelector(
  selectFilterOptions,
  filterOptions =>
    (filterOptions.showRetired ? 1 : 0) +
    (filterOptions.onlyMoonpot ? 1 : 0) +
    (filterOptions.onlyBoosted ? 1 : 0) +
    (filterOptions.platformId !== null ? 1 : 0) +
    filterOptions.chainIds.length
);

export const selectHasActiveFilter = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.vaultType !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.showRetired !== false ||
    filterOptions.onlyMoonpot !== false ||
    filterOptions.onlyBoosted !== false ||
    filterOptions.searchText !== '' ||
    filterOptions.platformId !== null ||
    filterOptions.chainIds.length > 0
);

export const selectVaultCategory = createSelector(
  selectFilterOptions,
  filterOptions => filterOptions.vaultCategory
);

export const selectFilteredVaults = createSelector(
  (state: BeefyState) => {
    const filterOptions = selectFilterOptions(state);
    const vaults = state.entities.vaults.allIds.map(id => selectVaultById(state, id));
    const tvlByVaultId = state.biz.tvl.byVaultId;
    const apyByVaultId = state.biz.apy.byVaultId;

    // apply filtering
    const chainIdMap = createIdMap(filterOptions.chainIds);
    const filteredVaults = vaults.filter(vault => {
      if (filterOptions.vaultCategory === 'featured' && !selectIsVaultFeatured(state, vault.id)) {
        return false;
      }
      if (filterOptions.vaultCategory === 'bluechip' && !selectIsVaultBlueChip(state, vault.id)) {
        return false;
      }
      if (filterOptions.vaultCategory === 'stable' && !selectIsVaultStable(state, vault.id)) {
        return false;
      }
      if (filterOptions.vaultCategory === 'beefy' && !selectIsVaultBeefy(state, vault.id)) {
        return false;
      }

      if (filterOptions.chainIds.length > 0 && !chainIdMap[vault.chainId]) {
        return false;
      }
      if (filterOptions.platformId !== null && vault.platformId !== filterOptions.platformId) {
        return false;
      }
      if (!filterOptions.showRetired && !isVaultActive(vault)) {
        return false;
      }
      if (filterOptions.onlyMoonpot && !selectIsVaultMoonpot(state, vault.id)) {
        return false;
      }
      if (filterOptions.onlyBoosted && !selectIsVaultBoosted(state, vault.id)) {
        return false;
      }

      // hide when no wallet balance of deposit token
      if (
        filterOptions.userCategory === 'eligible' &&
        !selectHasWalletBalanceOfToken(state, vault.chainId, vault.oracleId)
      ) {
        return false;
      }

      if (
        filterOptions.userCategory === 'deposited' &&
        !selectHasUserDepositInVault(state, vault.id)
      ) {
        return false;
      }

      // Hide when the given searchword is found neither in the vault's name nor among its
      // tokens or those of an involved, active boost. "Fuzzily" account also along the way
      // for the standardly named wrapped version of a token.
      const S = filterOptions.searchText.toLowerCase();
      if (S.length > 0 && !vault.name.toLowerCase().includes(S)) {
        if (S.length < 2) return false;
        const O_TST = new RegExp(`^w?${S}$`),
          O_NOW = Date.now() / 1000;
        if (
          !(
            vault.assetIds.find(S_TKN => S_TKN.toLowerCase().match(O_TST)) ||
            (vault.isGovVault && vault.earnedTokenId.toLowerCase().match(O_TST)) ||
            (selectIsVaultBoosted(state, vault.id) &&
              selectActiveVaultBoostIds(state, vault.id)
                .map(boostId => selectBoostById(state, boostId))
                .some(
                  O =>
                    'active' === O.status &&
                    // TODO
                    //O_NOW < parseInt(O.periodFinish) &&
                    O.earnedTokenId.toLowerCase().match(O_TST)
                ))
          )
        )
          return false;
      }

      return true;
    });

    // apply sort
    let sortedVaults = filteredVaults;
    if (filterOptions.sort === 'apy') {
      sortedVaults = sortBy(sortedVaults, vault => {
        const apy = apyByVaultId[vault.id];
        if (!apy) {
          return 0;
        }
        if (isStandardVaultApy(apy)) {
          return -apy.totalApy;
        } else if (isGovVaultApy(apy)) {
          return -apy.vaultApr;
        } else if (isMaxiVaultApy(apy)) {
          return -apy.totalApy;
        } else {
          throw new Error('Apy type not supported');
        }
      });
    } else if (filterOptions.sort === 'tvl') {
      sortedVaults = sortBy(sortedVaults, vault => {
        const tvl = tvlByVaultId[vault.id];
        if (!tvl) {
          return 0;
        }
        return -tvl.tvl.toNumber();
      });
    } else if (filterOptions.sort === 'safetyScore') {
      sortedVaults = sortBy(sortedVaults, vault => {
        return -vault.safetyScore;
      });
    }

    return sortedVaults;
  },
  res => res
);

export const selectFilteredVaultCount = createSelector(selectFilteredVaults, ids => ids.length);

export const selectTotalVaultCount = createSelector(
  (state: BeefyState) => state.entities.vaults.allIds.length,
  c => c
);

function createIdMap(ids: string[]) {
  const map = {};
  for (const id of ids) {
    map[id] = true;
  }
  return map;
}
