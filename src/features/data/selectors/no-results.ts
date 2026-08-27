import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { boundedLevenshtein, simplifySearchText } from '../../../helpers/string.ts';
import type { FilterValues } from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import { buildVaultFilterEnv, vaultPassesFilters } from '../utils/vault-filter.ts';
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

function countMatching(state: BeefyState, filters: FilterValues): number {
  const env = buildVaultFilterEnv(state, filters);
  let count = 0;
  for (const vaultId of selectAllVisibleVaultIds(state)) {
    if (vaultPassesFilters(state, selectVaultById(state, vaultId), filters, env)) {
      count++;
    }
  }
  return count;
}

function anyMatching(state: BeefyState, filters: FilterValues): boolean {
  const env = buildVaultFilterEnv(state, filters);
  return selectAllVisibleVaultIds(state).some(vaultId =>
    vaultPassesFilters(state, selectVaultById(state, vaultId), filters, env)
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

function computeDidYouMean(state: BeefyState, searchText: string): string[] {
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

function computeSearchNoResultsInfo(state: BeefyState, filters: FilterValues): SearchNoResultsInfo {
  const queryKind = classifySearchQuery(filters.searchText);
  if (queryKind === 'address-too-short') {
    return { kind: 'address-too-short' };
  }

  const searchOnly = clearBlockerCategories(filters, ALL_BLOCKER_CATEGORIES);
  const active = listActiveBlockerCategories(filters);
  if (active.length > 0 && anyMatching(state, searchOnly)) {
    let blockers = active.filter(category =>
      anyMatching(state, clearBlockerCategories(filters, [category]))
    );
    if (blockers.length === 0) {
      // joint blockage: no single filter is solely responsible, offer to clear them all
      blockers = active;
    }
    return {
      kind: 'blocked',
      blockers,
      // honest count: what clearing exactly these blockers will reveal
      showCount: countMatching(state, clearBlockerCategories(filters, blockers)),
    };
  }

  if (!filters.onlyRetired) {
    const retiredCount = countMatching(state, { ...searchOnly, onlyRetired: true });
    if (retiredCount > 0) {
      return { kind: 'retired', count: retiredCount };
    }
  }

  if (queryKind === 'address') {
    return { kind: 'address-no-match' };
  }

  return { kind: 'suggestions', suggestions: computeDidYouMean(state, filters.searchText) };
}

// identity cache for a stable useAppSelector result; renews each recalc (counts use polled data)
let cache: { filters: FilterValues; vaultIds: unknown; info: SearchNoResultsInfo } | undefined;

export function selectSearchNoResultsInfo(state: BeefyState): SearchNoResultsInfo {
  const filters = selectFilterAppliedValues(state);
  const vaultIds = selectAllVisibleVaultIds(state);
  if (!cache || cache.filters !== filters || cache.vaultIds !== vaultIds) {
    cache = { filters, vaultIds, info: computeSearchNoResultsInfo(state, filters) };
  }
  return cache.info;
}
