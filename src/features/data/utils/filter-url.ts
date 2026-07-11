import BigNumber from 'bignumber.js';
import { config as chainConfigs } from '../../../config/config.ts';
import { AVG_APY_PERIODS } from '../../../helpers/apy.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { ChainId } from '../entities/chain.ts';
import type {
  AvgApySortType,
  FilteredVaultsPreset,
  SortDirectionType,
  SortType,
  StrategiesType,
  VaultAssetType,
  VaultCategoryType,
} from '../reducers/filtered-vaults-types.ts';
import { isDefined } from './array-utils.ts';

type FilterUrlCarry = Array<[string, string]>;

type SerializeFiltersOptions = {
  /** unrecognized params (feature flags, utm etc.) to carry through */
  carry?: FilterUrlCarry;
};

type ParsedFilterSearch = {
  preset: FilteredVaultsPreset;
  /** whether the search contained at least one filter param */
  recognized: boolean;
  carry: FilterUrlCarry;
};

// exhaustive records so adding a value to the union fails to compile here
const CATEGORY_VALUES: string[] = Object.keys({
  stable: true,
  bluechip: true,
  meme: true,
  correlated: true,
} satisfies Record<VaultCategoryType, true>);
const STRATEGY_VALUES: string[] = Object.keys({
  pools: true,
  vaults: true,
} satisfies Record<Exclude<StrategiesType, 'all'>, true>); // 'all' is the default and omitted
const SORT_VALUES: string[] = Object.keys({
  apy: true,
  daily: true,
  tvl: true,
  depositValue: true,
} satisfies Record<Exclude<SortType, 'default'>, true>); // 'default' omitted
// derived from the UI's options so urls can't create sub-sort states the table can't render
const SUB_SORT_APY_VALUES: readonly AvgApySortType[] = AVG_APY_PERIODS;
const ASSET_TO_PARAM: Record<VaultAssetType, string> = { lps: 'lp', single: 'single', clm: 'clm' };
const PARAM_TO_ASSET: Record<string, VaultAssetType | undefined> = Object.fromEntries(
  (Object.entries(ASSET_TO_PARAM) as Array<[VaultAssetType, string]>).map(
    ([asset, param]) => [param, asset] as const
  )
);
const FLAG_PARAMS = [
  ['boosted', 'onlyBoosted'],
  ['zappable', 'onlyZappable'],
  ['points', 'onlyEarningPoints'],
  ['retired', 'onlyRetired'],
  ['paused', 'onlyPaused'],
] as const satisfies Array<[string, keyof FilteredVaultsPreset]>;
const PARAM_TO_FLAG: Record<string, (typeof FLAG_PARAMS)[number][1] | undefined> =
  Object.fromEntries(FLAG_PARAMS);

const CHAIN_IDS: string[] = Object.keys(chainConfigs);

function isChainId(value: string): value is ChainId {
  return CHAIN_IDS.includes(value);
}

function isVaultCategory(value: string): value is VaultCategoryType {
  return CATEGORY_VALUES.includes(value);
}

function isStrategyValue(value: string): value is Exclude<StrategiesType, 'all'> {
  return STRATEGY_VALUES.includes(value);
}

function isSortValue(value: string): value is Exclude<SortType, 'default'> {
  return SORT_VALUES.includes(value);
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// items are id slugs; a literal comma in an item would not survive a round-trip
function encodeList(values: string[]): string {
  return values.map(encodeURIComponent).join(',');
}

function serializeSort(
  sort: SortType | undefined,
  direction: SortDirectionType | undefined,
  subSortApy: AvgApySortType | undefined
): string | undefined {
  if (!sort || sort === 'default') {
    return undefined;
  }
  const parts: string[] = [sort];
  if (sort === 'apy' && subSortApy !== undefined && subSortApy !== 'default') {
    parts.push(`${subSortApy}d`);
  }
  if (direction === 'asc') {
    parts.push('asc');
  }
  return parts.join('-');
}

function parseSort(value: string): Partial<FilteredVaultsPreset> {
  const [field, ...suffixes] = value.split('-');
  if (!isSortValue(field)) {
    return {};
  }
  const preset: Partial<FilteredVaultsPreset> = { sort: field };
  for (const suffix of suffixes) {
    if (suffix === 'asc') {
      preset.sortDirection = 'asc';
    } else if (field === 'apy' && suffix.endsWith('d')) {
      const days = Number(suffix.slice(0, -1));
      const subSort = SUB_SORT_APY_VALUES.find(v => v === days);
      if (subSort) {
        preset.subSort = { apy: subSort };
      }
    }
  }
  return preset;
}

/**
 * Serializes filters into a canonical, human-readable search string ('' or '?...').
 * Hand-rolled on purpose: URLSearchParams would percent-encode list commas and
 * render valueless flags as `boosted=`.
 */
export function serializeFilters(
  filters: FilteredVaultsPreset,
  options?: SerializeFiltersOptions
): string {
  const parts: string[] = [];
  const add = (key: string, value?: string) =>
    parts.push(value === undefined ? key : `${key}=${value}`);

  if (filters.platformIds?.length) {
    add('platform', encodeList(filters.platformIds));
  }
  if (filters.chainIds?.length) {
    add('chain', encodeList(filters.chainIds));
  }
  if (filters.vaultCategory?.length) {
    add('category', encodeList(filters.vaultCategory));
  }
  if (filters.assetType?.length) {
    add('asset', encodeList(filters.assetType.map(asset => ASSET_TO_PARAM[asset])));
  }
  if (filters.strategyType && filters.strategyType !== 'all') {
    add('strategy', filters.strategyType);
  }
  if (filters.searchText) {
    add('q', encodeURIComponent(filters.searchText));
  }
  if (filters.minimumUnderlyingTvl?.gt(BIG_ZERO)) {
    add('mintvl', filters.minimumUnderlyingTvl.toString(10));
  }
  for (const [param, flag] of FLAG_PARAMS) {
    if (filters[flag]) {
      add(param);
    }
  }
  const sort = serializeSort(filters.sort, filters.sortDirection, filters.subSort?.apy);
  if (sort) {
    add('sort', sort);
  }
  for (const [key, value] of options?.carry || []) {
    add(encodeURIComponent(key), value === '' ? undefined : encodeURIComponent(value));
  }

  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Parses a search string into a filter preset. Invalid values are dropped
 * individually; unrecognized params are returned for carry-through.
 */
export function parseFilterSearch(search: string): ParsedFilterSearch {
  const params = new URLSearchParams(search);
  const preset: FilteredVaultsPreset = {};
  const carry: FilterUrlCarry = [];
  let recognized = false;

  for (const [key, value] of params.entries()) {
    const flag = PARAM_TO_FLAG[key];
    if (flag) {
      // flags are emitted bare; tolerate hand-typed ?boosted=false
      if (value !== 'false' && value !== '0') {
        preset[flag] = true;
      }
      recognized = true;
      continue;
    }
    switch (key) {
      case 'platform':
        preset.platformIds = splitList(value);
        recognized = true;
        break;
      case 'chain':
        preset.chainIds = splitList(value.toLowerCase()).filter(isChainId);
        recognized = true;
        break;
      case 'category':
        preset.vaultCategory = splitList(value.toLowerCase()).filter(isVaultCategory);
        recognized = true;
        break;
      case 'asset':
        preset.assetType = splitList(value.toLowerCase())
          .map(asset => PARAM_TO_ASSET[asset])
          .filter(isDefined);
        recognized = true;
        break;
      case 'strategy': {
        const strategy = value.toLowerCase();
        if (isStrategyValue(strategy)) {
          preset.strategyType = strategy;
        }
        recognized = true;
        break;
      }
      case 'q':
        preset.searchText = value;
        recognized = true;
        break;
      case 'mintvl': {
        const tvl = new BigNumber(value);
        if (!tvl.isNaN() && tvl.gt(BIG_ZERO)) {
          preset.minimumUnderlyingTvl = tvl;
        }
        recognized = true;
        break;
      }
      case 'sort':
        Object.assign(preset, parseSort(value));
        recognized = true;
        break;
      default:
        carry.push([key, value]);
        break;
    }
  }

  return { preset, recognized, carry };
}

/** Canonical form of a search string, used for fixed-point comparisons and re-serialization */
export function canonicalizeSearch(search: string, options?: SerializeFiltersOptions): string {
  const { preset, carry } = parseFilterSearch(search);
  return serializeFilters(preset, {
    ...options,
    carry: options?.carry ? [...carry, ...options.carry] : carry,
  });
}
