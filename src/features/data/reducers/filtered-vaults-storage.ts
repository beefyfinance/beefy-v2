import { getLiveLocation } from '../../../components/Router/live-location.ts';
import { storageGet, storageSet } from '../../../helpers/storage.ts';
import { parseFilterSearch, serializeFilters } from '../utils/filter-url.ts';
import { FILTER_DEFAULTS, mergePreset } from '../utils/filter-values.ts';
import {
  FilterContent,
  type FilteredVaultsState,
  type FilterValues,
  isSortPickedInPreset,
} from './filtered-vaults-types.ts';

export const FILTERS_STORAGE_KEY = 'vaultFilters';

/** prefer url, then local storage, then defaults */
export function composeInitialFilterValues(
  stored: string | null,
  urlSearch: string | null
): FilterValues {
  for (const source of [urlSearch, stored]) {
    if (!source) {
      continue;
    }

    const { preset, recognized } = parseFilterSearch(source);
    if (recognized) {
      return mergePreset(FILTER_DEFAULTS, preset);
    }
  }

  return FILTER_DEFAULTS;
}

/** Initial slice state built at store creation, so the first render needs no url/storage reconciliation */
export function buildInitialFilteredVaultsState(): FilteredVaultsState {
  const location = typeof window !== 'undefined' ? getLiveLocation() : null;
  const values = composeInitialFilterValues(
    storageGet(FILTERS_STORAGE_KEY),
    // filter params are only meaningful on the vault list route
    location && location.pathname === '/' ? location.search : null
  );

  return {
    pending: values,
    applied: values,
    // a restored url/storage session with ?q= + explicit sort keeps that sort over relevance
    sortPickedDuringSearch: isSortPickedInPreset(values.searchText, values.sort),
    filteredVaultIds: [],
    sortedFilteredVaultIds: [],
    recalculatedForSearchText: '',
    searchRanked: false,
    filterContent: FilterContent.Filter,
  };
}

export function storeFilters(values: FilterValues): void {
  storageSet(FILTERS_STORAGE_KEY, serializeFilters(values));
}
