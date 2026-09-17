import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { boundedLevenshtein, simplifySearchText } from '../../../helpers/string.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { FilterValues } from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import { selectVaultFilterEnv, selectVaultPassesFilters } from '../utils/vault-filter.ts';
import { classifySearchQuery, toDisplayWords } from '../utils/vault-search.ts';
import { selectAllChains } from './chains.ts';
import { selectFilterAppliedValues } from './filtered-vaults.ts';
import { selectUsedPlatforms } from './platforms.ts';
import { resolveAssetToken, resolveStockCompanyName } from './tokens.ts';
import { selectAllVisibleVaultIds, selectVaultById } from './vaults.ts';

export type BlockerCategory =
  | 'chain'
  | 'platform'
  | 'category'
  | 'type'
  | 'product'
  | 'flags'
  | 'mintvl'
  | 'userCategory';

const ALL_BLOCKER_CATEGORIES: BlockerCategory[] = [
  'chain',
  'platform',
  'category',
  'type',
  'product',
  'flags',
  'mintvl',
  'userCategory',
];

export const FLAG_KEYS = [
  'onlyRetired',
  'onlyPaused',
  'onlyBoosted',
  'onlyZappable',
  'onlyEarningPoints',
  'onlyUnstakedClm',
] as const;

export type SearchNoResultsInfo =
  | { kind: 'address-too-short' }
  | { kind: 'address-no-match' }
  | { kind: 'blocked'; blockers: BlockerCategory[]; showCount: number }
  | { kind: 'retired'; count: number }
  | { kind: 'suggestions'; suggestions: string[] };

export function listActiveBlockerCategories(filters: FilterValues): BlockerCategory[] {
  return ALL_BLOCKER_CATEGORIES.filter(category => {
    switch (category) {
      case 'chain':
        return filters.chainIds.length > 0;
      case 'platform':
        return filters.platformIds.length > 0;
      case 'category':
        return filters.vaultCategory.length > 0;
      case 'type':
        return filters.assetType.length > 0;
      case 'product':
        return filters.strategyType !== 'all';
      case 'flags':
        return FLAG_KEYS.some(key => filters[key]);
      case 'mintvl':
        return filters.minimumUnderlyingTvl.gt(0);
      case 'userCategory':
        return filters.userCategory !== 'all';
    }
  });
}

export function clearBlockerCategories(
  filters: FilterValues,
  categories: readonly BlockerCategory[]
): FilterValues {
  const cleared = { ...filters };
  for (const category of categories) {
    switch (category) {
      case 'chain':
        cleared.chainIds = [];
        break;
      case 'platform':
        cleared.platformIds = [];
        break;
      case 'category':
        cleared.vaultCategory = [];
        break;
      case 'type':
        cleared.assetType = [];
        break;
      case 'product':
        cleared.strategyType = 'all';
        break;
      case 'flags':
        for (const key of FLAG_KEYS) {
          cleared[key] = false;
        }
        break;
      case 'mintvl':
        cleared.minimumUnderlyingTvl = BIG_ZERO;
        break;
      case 'userCategory':
        cleared.userCategory = 'all';
        break;
    }
  }
  return cleared;
}

function selectVaultIdsMatchingSearchText(
  state: BeefyState,
  filters: FilterValues
): VaultEntity['id'][] {
  const env = selectVaultFilterEnv(state, filters);
  return selectAllVisibleVaultIds(state).filter(vaultId =>
    env.matchesSearch(selectVaultById(state, vaultId))
  );
}

function selectCountMatching(
  state: BeefyState,
  filters: FilterValues,
  vaultIds: readonly VaultEntity['id'][]
): number {
  const env = selectVaultFilterEnv(state, filters);
  let count = 0;
  for (const vaultId of vaultIds) {
    if (selectVaultPassesFilters(state, selectVaultById(state, vaultId), filters, env)) {
      count++;
    }
  }
  return count;
}

function selectAnyMatching(
  state: BeefyState,
  filters: FilterValues,
  vaultIds: readonly VaultEntity['id'][]
): boolean {
  const env = selectVaultFilterEnv(state, filters);
  return vaultIds.some(vaultId =>
    selectVaultPassesFilters(state, selectVaultById(state, vaultId), filters, env)
  );
}

const selectSearchDictionary = createSelector(
  selectAllVisibleVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState) => state.entities.tokens.byChainId,
  selectAllChains,
  selectUsedPlatforms,
  (vaultIds, vaultsById, tokensByChainId, chains, platforms) => {
    const entries = new Map<string, string>();
    const add = (text: string) => entries.set(text.toLowerCase(), text);
    for (const vaultId of vaultIds) {
      const vault = vaultsById[vaultId];
      if (!vault) {
        continue;
      }
      for (const assetId of vault.assetIds) {
        const token = resolveAssetToken(tokensByChainId, vault.chainId, assetId);
        add(token?.symbol || assetId);
        const company = resolveStockCompanyName(token);
        if (company) {
          for (const word of toDisplayWords(company)) {
            add(word);
          }
        }
      }
    }
    for (const chain of chains) {
      add(chain.name);
    }
    for (const platform of platforms) {
      add(platform.name);
    }
    return [...entries.entries()].map(([lower, display]) => ({ lower, display }));
  }
);

function selectDidYouMean(state: BeefyState, searchText: string): string[] {
  const query = simplifySearchText(searchText).toLowerCase();
  // multi-word typo correction is noise; single words only
  if (query.length < 3 || query.includes(' ')) {
    return [];
  }
  return selectSearchDictionary(state)
    .map(({ lower, display }) => ({ display, distance: boundedLevenshtein(query, lower, 2) }))
    .filter(entry => entry.distance > 0 && entry.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(entry => entry.display);
}

function selectSearchNoResultsInfoUncached(
  state: BeefyState,
  filters: FilterValues
): SearchNoResultsInfo {
  const queryKind = classifySearchQuery(filters.searchText);
  if (queryKind === 'address-too-short') {
    return { kind: 'address-too-short' };
  }

  const searchOnly = clearBlockerCategories(filters, ALL_BLOCKER_CATEGORIES);
  const searchMatches = selectVaultIdsMatchingSearchText(state, searchOnly);
  const active = listActiveBlockerCategories(filters);
  if (active.length > 0 && selectAnyMatching(state, searchOnly, searchMatches)) {
    let blockers = active.filter(category =>
      selectAnyMatching(state, clearBlockerCategories(filters, [category]), searchMatches)
    );
    if (blockers.length === 0) {
      // joint blockage: no single filter is solely responsible, offer to clear them all
      blockers = active;
    }
    return {
      kind: 'blocked',
      blockers,
      // honest count: what clearing exactly these blockers will reveal
      showCount: selectCountMatching(
        state,
        clearBlockerCategories(filters, blockers),
        searchMatches
      ),
    };
  }

  if (!filters.onlyRetired) {
    const retiredCount = selectCountMatching(
      state,
      { ...searchOnly, onlyRetired: true },
      searchMatches
    );
    if (retiredCount > 0) {
      return { kind: 'retired', count: retiredCount };
    }
  }

  if (queryKind === 'address') {
    return { kind: 'address-no-match' };
  }

  return { kind: 'suggestions', suggestions: selectDidYouMean(state, filters.searchText) };
}

/**
 * A filter recalc does not renew this: the `applied` payload is the same object as `pending`, so
 * immer keeps its identity. The wallet and its balances are part of the key too, or a wallet
 * change serves the previous wallet's blocker list and count.
 */
let cache: { deps: unknown[]; info: SearchNoResultsInfo } | undefined;

export function selectSearchNoResultsInfo(state: BeefyState): SearchNoResultsInfo {
  const filters = selectFilterAppliedValues(state);
  const deps: unknown[] = [
    filters,
    selectAllVisibleVaultIds(state),
    // the raw address, not the effective one: the dev override is fixed for the page lifetime
    state.user.wallet.address,
    state.user.balance.byAddress,
    // every slice selectVaultPassesFilters reads through, or the blocker list and count go stale on screen
    state.entities?.vaults?.byId,
    state.entities?.vaults?.contractData?.byVaultId,
    state.entities?.tokens?.byChainId,
    state.entities?.tokens?.breakdown?.byOracleId,
    state.entities?.chains,
    state.entities?.platforms,
    state.entities?.promos,
    state.entities?.zaps?.vaults?.byId,
    state.biz?.apy?.totalApy,
    state.ui?.savedVaults?.byVaultId,
  ];
  const previous = cache;
  if (previous && deps.every((dep, i) => dep === previous.deps[i])) {
    return previous.info;
  }
  // assigned only after the compute returns, so a throw is not cached
  cache = { deps, info: selectSearchNoResultsInfoUncached(state, filters) };
  return cache.info;
}
