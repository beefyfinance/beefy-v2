import _, { isEqual } from 'lodash';
import { ChainEntity } from '../features/data/entities/chain';
import {
  filteredVaultsActions,
  FilteredVaultsState,
  initialFilteredVaultsState,
} from '../features/data/reducers/filtered-vaults';

const URL_PARAM_FILTER_SORT = 'sort';
const URL_PARAM_FILTER_SORT_DIRECTION = 'sortDirection';
const URL_PARAM_FILTER_VAULT_CATEGORY = 'vaultCategory';
const URL_PARAM_FILTER_USER_CATEGORY = 'userCategory';
const URL_PARAM_VAULT_TYPE = 'vaultType';
const URL_PARAM_FILTER_SEARCH_TEXT = 'searchText';
const URL_PARAM_FILTER_CHAIN_IDS = 'chains';
const URL_PARAM_FILTER_PLATFORM_ID = 'platformId';
const URL_PARAM_FILTER_ONLY_RETIRED = 'onlyRetired';
const URL_PARAM_FILTER_ONLY_PAUSED = 'onlyPaused';
const URL_PARAM_FILTER_ONLY_BOOSTED = 'onlyBoosted';

/**
 * Given a string of comma separated chain names, return an array of chainIDs for each chain name
 * @param {string} value - string =&gt; The string that contains the chain names separated by commas
 * @param chainsById - { [id: string]: ChainEntity; }
 * @returns An Array of strings containing the equivalent chainID for each chain name
 */
function stringToChainIDs(
  value: string,
  chainsById: {
    [id: string]: ChainEntity;
  }
) {
  const arrayChains = Object.values(chainsById);

  const paramItems: Array<string> = (value ?? '')
    .split(',')
    .reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

  // Now we need to iterate those items to return an Array<string> containing the equivalent
  // chainID for each chain name
  return paramItems
    .filter(item => {
      const _item = arrayChains.find(element => element.id === cleanString(item));

      if (!_item) return false;

      return true;
    })
    .map(item => {
      const _item = arrayChains.find(element => element.id === cleanString(item));
      return _item.id;
    });
}

/**
 * It takes an array of strings, and an object with string keys and values of type `ChainEntity`, and
 * returns a string of the `id` property of each `ChainEntity` in the object whose key is in the array
 * @param chainIDs - Array<string>
 * @param chainsById - { [id: string]: ChainEntity; }
 * @returns A string of the chainIDs that are in the chainsById object.
 */
function chainIDsToString(
  chainIDs: Array<string>,
  chainsById: {
    [id: string]: ChainEntity;
  }
) {
  return chainIDs
    .filter(chainID => {
      const _item = chainsById[chainID];
      if (!_item) return false;

      return true;
    })
    .map(chainID => {
      const _item = chainsById[chainID];

      return _item.id;
    })
    .join(',');
}

/**
 * It takes a filterState object and a chainsById object and returns a string
 * @param  - URL_PARAM_FILTER_SORT
 * @returns A string
 */
export function filtersToUrl({
  filterState,
  chainsById,
  urlParams
}: {
  filterState: FilteredVaultsState;
  chainsById: {
    [id: string]: ChainEntity;
  };
  urlParams?: URLSearchParams;
}): string {
  const currentURLParams = urlParams ?? new URLSearchParams();

  // Filter Sort
  if (filterState.sort !== initialFilteredVaultsState.sort) {
    currentURLParams.set(URL_PARAM_FILTER_SORT, filterState.sort);
  }

  // Filter Sort Direction
  if (filterState.sortDirection !== initialFilteredVaultsState.sortDirection) {
    currentURLParams.set(URL_PARAM_FILTER_SORT_DIRECTION, filterState.sortDirection);
  }

  // Filter Vault Category
  if (filterState.vaultCategory !== initialFilteredVaultsState.vaultCategory) {
    currentURLParams.set(URL_PARAM_FILTER_VAULT_CATEGORY, filterState.vaultCategory);
  }

  // Filter User Category
  if (filterState.userCategory !== initialFilteredVaultsState.userCategory) {
    currentURLParams.set(URL_PARAM_FILTER_USER_CATEGORY, filterState.userCategory);
  }

  // Filter Vault Type
  if (filterState.vaultType !== initialFilteredVaultsState.vaultType) {
    currentURLParams.set(URL_PARAM_VAULT_TYPE, filterState.vaultType);
  }

  // Filter Search Text
  if (filterState.searchText !== initialFilteredVaultsState.searchText) {
    currentURLParams.set(URL_PARAM_FILTER_SEARCH_TEXT, filterState.searchText);
  }

  // Filter Chain IDs
  if (isEqual(filterState.chainIds, initialFilteredVaultsState.chainIds) === false) {
    currentURLParams.set(
      URL_PARAM_FILTER_CHAIN_IDS,
      chainIDsToString(filterState.chainIds, chainsById)
    );
  }else if(_.isEmpty(chainsById)===false){
    currentURLParams.delete(URL_PARAM_FILTER_CHAIN_IDS)
  }

  // Filter Platform ID
  if (filterState.platformId !== initialFilteredVaultsState.platformId) {
    currentURLParams.set(URL_PARAM_FILTER_PLATFORM_ID, filterState.platformId);
  }

  // Filter Only Retired
  if (filterState.onlyRetired !== initialFilteredVaultsState.onlyRetired) {
    currentURLParams.set(URL_PARAM_FILTER_ONLY_RETIRED, filterState.onlyRetired.toString());
  }

  // Filter Only Paused
  if (filterState.onlyPaused !== initialFilteredVaultsState.onlyPaused) {
    currentURLParams.set(URL_PARAM_FILTER_ONLY_PAUSED, filterState.onlyPaused.toString());
  }

  // Filter Only Boosted
  if (filterState.onlyBoosted !== initialFilteredVaultsState.onlyBoosted) {
    currentURLParams.set(URL_PARAM_FILTER_ONLY_BOOSTED, filterState.onlyBoosted.toString());
  }

  return getURLWithParams(currentURLParams);
}

/**
 * It takes a string and returns a lowercase version of the string with no leading or trailing
 * whitespace.
 * @param {string} str - The string to be cleaned.
 * @returns the string that is passed in, but it is being converted to lowercase and trimmed.
 */
function cleanString(str: string) {
  return str.toLowerCase().trim();
}

/**
 * It takes a URL and a dispatcher and it dispatches actions to the store based on the URL
 * @param  - URL_PARAM_FILTER_SORT
 */
export function urlToFilters({
  url,
  dispatcher,
  chainsById,
}: {
  url: URLSearchParams;
  dispatcher: Function;
  chainsById: {
    [id: string]: ChainEntity;
  };
}) {
  // Let's parse every possible Search Param
  // Filter Sort
  const filterSort = url.get(URL_PARAM_FILTER_SORT);
  if (
    filterSort &&
    ['tvl', 'apy', 'daily', 'safetyScore', 'default', 'depositValue', 'walletValue'].includes(
      cleanString(filterSort)
    )
  ) {
    // We have to do that cast although we are already 100% sure it is one of those options since TS is not detecting it and I don't want to do a ts-ignore
    dispatcher(
      filteredVaultsActions.setSort(
        cleanString(filterSort) as
          | 'tvl'
          | 'apy'
          | 'daily'
          | 'safetyScore'
          | 'default'
          | 'depositValue'
          | 'walletValue'
      )
    );
  }

  // Filter Sort Direction
  const filterSortDirection = url.get(URL_PARAM_FILTER_SORT_DIRECTION);
  if (filterSortDirection && ['asc', 'desc'].includes(cleanString(filterSortDirection))) {
    // We have to do that cast although we are already 100% sure it is one of those options since TS is not detecting it and I don't want to do a ts-ignore
    dispatcher(
      filteredVaultsActions.setSortDirection(cleanString(filterSortDirection) as 'asc' | 'desc')
    );
  }

  // Filter Vault Category
  const filterVaultCategory = url.get(URL_PARAM_FILTER_VAULT_CATEGORY);
  if (
    filterVaultCategory &&
    ['all', 'featured', 'stable', 'bluechip', 'beefy'].includes(cleanString(filterVaultCategory))
  ) {
    // We have to do that cast although we are already 100% sure it is one of those options since TS is not detecting it and I don't want to do a ts-ignore
    dispatcher(
      filteredVaultsActions.setVaultCategory(
        cleanString(filterVaultCategory) as 'all' | 'featured' | 'stable' | 'bluechip' | 'beefy'
      )
    );
  }

  // Filter User Category
  const filterUserCategory = url.get(URL_PARAM_FILTER_USER_CATEGORY);
  if (
    filterUserCategory &&
    ['all', 'eligible', 'deposited'].includes(cleanString(filterUserCategory))
  ) {
    // We have to do that cast although we are already 100% sure it is one of those options since TS is not detecting it and I don't want to do a ts-ignore
    dispatcher(
      filteredVaultsActions.setUserCategory(
        cleanString(filterUserCategory) as 'all' | 'eligible' | 'deposited'
      )
    );
  }

  // Filter Vault Type
  const filterVaultType = url.get(URL_PARAM_VAULT_TYPE);
  if (filterVaultType && ['all', 'lps', 'single'].includes(cleanString(filterVaultType))) {
    // We have to do that cast although we are already 100% sure it is one of those options since TS is not detecting it and I don't want to do a ts-ignore
    dispatcher(
      filteredVaultsActions.setVaultType(cleanString(filterVaultType) as 'all' | 'lps' | 'single')
    );
  }

  // Filter Search Text
  const filterSearchText = url.get(URL_PARAM_FILTER_SEARCH_TEXT);
  if (filterSearchText && filterSearchText.trim()) {
    dispatcher(filteredVaultsActions.setSearchText(filterSearchText));
  }

  // Filter Chain IDs
  const filterChainIDs = url.get(URL_PARAM_FILTER_CHAIN_IDS);
  console.warn("urlToFilters", chainsById, _.isEmpty(chainsById))
  if (filterChainIDs) {
    const arrayChainIDs = stringToChainIDs(filterChainIDs, chainsById);
    if (arrayChainIDs.length > 0) {
      dispatcher(filteredVaultsActions.setChainIds(arrayChainIDs));
    }
  }

  // Filter Platform ID
  const filterPlatformID = url.get(URL_PARAM_FILTER_PLATFORM_ID);
  dispatcher(filteredVaultsActions.setPlatformId(filterPlatformID));

  // Filter Only Retired
  const filterOnlyRetired = url.get(URL_PARAM_FILTER_ONLY_RETIRED);
  dispatcher(filteredVaultsActions.setOnlyRetired(filterOnlyRetired === 'true'));

  // Filter Only Paused
  const filterOnlyPaused = url.get(URL_PARAM_FILTER_ONLY_PAUSED);
  dispatcher(filteredVaultsActions.setOnlyPaused(filterOnlyPaused === 'true'));

  // Filter Only Boosted
  const filterOnlyBoosted = url.get(URL_PARAM_FILTER_ONLY_BOOSTED);
  dispatcher(filteredVaultsActions.setOnlyBoosted(filterOnlyBoosted === 'true'));
}

/**
 * It takes a URLSearchParams object and returns a string that is the current URL with the querystring
 * updated to said params.
 * @param {URLSearchParams} [params] - The parameters you want to set on the URL; or undefined to remove all.
 * @returns The URL with updated querystring
 */
export function getURLWithParams(params?: URLSearchParams): string {
  const newURL = new URL(window.location.href);

  if (params) {
    newURL.search = `?${params.toString()}`;
  } else {
    newURL.search = '';
  }

  return newURL.toString();
}

/**
 * It returns a new instance of URLSearchParams, which is a class that parses the URL and returns an
 * object with the URL parameters
 * @returns A new instance of URLSearchParams.
 */
export function getURLParams(): URLSearchParams {
  return new URLSearchParams(
    window.location.search[0] === '?' ? window.location.search.slice(1) : ''
  );
}

/**
 * It updates the URL in the browser's address bar without reloading the page
 * @param {string} newURL - The new URL to update the browser's address bar to.
 */
export function updateURL(newURL: string) {
  window.history.replaceState(null, null, newURL);
}
