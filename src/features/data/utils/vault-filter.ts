import type { ChainEntity } from '../entities/chain.ts';
import {
  isCowcentratedLikeVault,
  isGovVault,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
  type VaultEntity,
} from '../entities/vault.ts';
import type { FilterValues } from '../reducers/filtered-vaults-types.ts';
import { selectUserBalanceOfToken, selectUserDepositedVaultIds } from '../selectors/balance.ts';
import { selectActiveChainIds, selectAllChainIds } from '../selectors/chains.ts';
import {
  selectFilterPlatformIdsForVault,
  selectIsVaultBlueChip,
  selectIsVaultCorrelated,
  selectIsVaultMeme,
  selectIsVaultStable,
  selectIsVaultStock,
  selectVaultIsBoostedForFilter,
} from '../selectors/filtered-vaults.ts';
import { selectIsVaultIdSaved } from '../selectors/saved-vaults.ts';
import { selectChainSearchIndex, selectPlatformSearchIndex } from '../selectors/search.ts';
import { selectVaultTokenNameWords, selectVaultTokenSymbols } from '../selectors/tokens.ts';
import { selectVaultUnderlyingTvlUsd } from '../selectors/tvl.ts';
import { selectVaultStrategyAddressOrUndefined } from '../selectors/vaults.ts';
import { selectVaultSupportsZap } from '../selectors/zap.ts';
import type { BeefyState } from '../store/types.ts';
import { EMPTY_ARRAY } from './selector-utils.ts';
import { buildVaultSearchContext, scoreVaultForSearch } from './vault-search.ts';

export type VaultFilterEnv = {
  visibleChains: ReadonlySet<ChainEntity['id']>;
  /** deposited vault ids for O(1) membership; only populated in the 'deposited' user category */
  depositedVaultIds: ReadonlySet<VaultEntity['id']>;
  /** true when the vault matches the search text; empty query matches all */
  matchesSearch: (vault: VaultEntity) => boolean;
};

/**
 * per-recalc environment: query matchers are compiled once, reused across every vault
 * @param searchScores when given, receives the relevance score of every matching vault
 */
export function buildVaultFilterEnv(
  state: BeefyState,
  filters: FilterValues,
  searchScores?: Map<VaultEntity['id'], number>
): VaultFilterEnv {
  const allChainIds =
    filters.userCategory === 'deposited' || filters.onlyRetired ?
      selectAllChainIds(state)
    : selectActiveChainIds(state);
  const visibleChains = new Set(filters.chainIds.length === 0 ? allChainIds : filters.chainIds);
  // only the deposited category consults this; skip the lookup/allocation otherwise
  const depositedVaultIds = new Set(
    filters.userCategory === 'deposited' ? selectUserDepositedVaultIds(state) : EMPTY_ARRAY
  );
  const searchContext = buildVaultSearchContext(
    filters.searchText,
    selectChainSearchIndex(state),
    selectPlatformSearchIndex(state)
  );

  return {
    visibleChains,
    depositedVaultIds,
    matchesSearch: vault => {
      if (!searchContext) {
        return true;
      }
      const score = scoreVaultForSearch(searchContext, {
        vault,
        tokenSymbols: selectVaultTokenSymbols(state, vault.id),
        tokenNameWords: selectVaultTokenNameWords(state, vault.id),
        platformIds:
          searchContext.anyPlatformWords ?
            selectFilterPlatformIdsForVault(state, vault)
          : EMPTY_ARRAY,
        strategyAddress:
          searchContext.addressNeedle !== undefined ?
            selectVaultStrategyAddressOrUndefined(state, vault.id)
          : undefined,
      });
      if (score > 0) {
        searchScores?.set(vault.id, score);
        return true;
      }
      return false;
    },
  };
}

/*
 @dev every filter that can be applied without using a selector should come first
 then cheap selectors, then expensive selectors last
*/
export function vaultPassesFilters(
  state: BeefyState,
  vault: VaultEntity,
  filterOptions: FilterValues,
  env: VaultFilterEnv
): boolean {
  // Chains
  if (!env.visibleChains.has(vault.chainId)) {
    return false;
  }

  // Strategy Type
  if (filterOptions.strategyType === 'pools' && !isGovVault(vault)) {
    return false;
  }

  // TODO change to !isStandardVault if we get rid of base clm
  if (filterOptions.strategyType === 'vaults' && isGovVault(vault)) {
    return false;
  }

  // Hide non-EOL if onlyRetired is checked
  if (filterOptions.onlyRetired && !isVaultRetired(vault)) {
    return false;
  }

  // Hide non-paused if onlyPaused is checked
  if (filterOptions.onlyPaused && !isVaultPaused(vault)) {
    return false;
  }

  // Hide EOL unless onlyRetired is checked or user category is 'My'
  if (
    !filterOptions.onlyRetired &&
    filterOptions.userCategory !== 'deposited' &&
    isVaultRetired(vault)
  ) {
    return false;
  }

  // Hide not earning points if onlyEarningPoints checked
  if (filterOptions.onlyEarningPoints && !isVaultEarningPoints(vault)) {
    return false;
  }

  // Hide non-zappable if onlyZappable checked
  if (filterOptions.onlyZappable && !selectVaultSupportsZap(state, vault.id)) {
    return false;
  }

  // Hide unselected asset types (if any asset type selected)
  if (filterOptions.assetType.length && !filterOptions.assetType.includes(vault.assetType)) {
    return false;
  }

  // Hide non-boosted if onlyBoosted checked
  if (filterOptions.onlyBoosted && !selectVaultIsBoostedForFilter(state, vault.id)) {
    return false;
  }

  // Vault Category
  if (filterOptions.vaultCategory.length) {
    if (
      filterOptions.vaultCategory.includes('bluechip') &&
      !selectIsVaultBlueChip(state, vault.id)
    ) {
      return false;
    }
    if (filterOptions.vaultCategory.includes('stable') && !selectIsVaultStable(state, vault.id)) {
      return false;
    }
    if (
      filterOptions.vaultCategory.includes('correlated') &&
      !selectIsVaultCorrelated(state, vault.id)
    ) {
      return false;
    }
    if (filterOptions.vaultCategory.includes('meme') && !selectIsVaultMeme(state, vault.id)) {
      return false;
    }
    if (filterOptions.vaultCategory.includes('stock') && !selectIsVaultStock(state, vault.id)) {
      return false;
    }
  }

  // User category: 'Saved'
  if (filterOptions.userCategory === 'saved' && !selectIsVaultIdSaved(state, vault.id)) {
    return false;
  }

  // User category: 'My Positions'
  if (filterOptions.userCategory === 'deposited') {
    // + onlyUnstakedClm
    if (filterOptions.onlyUnstakedClm) {
      if (
        !isCowcentratedLikeVault(vault) ||
        selectUserBalanceOfToken(state, vault.chainId, vault.depositTokenAddress).isZero()
      ) {
        return false;
      }
    } else if (!env.depositedVaultIds.has(vault.id)) {
      return false;
    }
  }

  // Platform
  if (filterOptions.platformIds.length) {
    const vaultPlatforms = selectFilterPlatformIdsForVault(state, vault);
    if (!filterOptions.platformIds.some(platform => vaultPlatforms.includes(platform))) {
      return false;
    }
  }

  // Search
  if (!env.matchesSearch(vault)) {
    return false;
  }

  // Underlying TVL
  if (
    filterOptions.minimumUnderlyingTvl.gt(0) &&
    selectVaultUnderlyingTvlUsd(state, vault.id).lt(filterOptions.minimumUnderlyingTvl)
  ) {
    return false;
  }

  // Default: Show
  return true;
}
