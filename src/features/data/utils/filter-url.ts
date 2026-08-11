import BigNumber from 'bignumber.js';
import { config as chainConfigs } from '../../../config/config.ts';
import { AVG_APY_PERIODS } from '../../../helpers/apy.ts';
import { entries, keys } from '../../../helpers/object.ts';
import type { ChainId } from '../entities/chain.ts';
import {
  type AvgApySortType,
  type FilteredVaultsPreset,
  type FilterValues,
  isRelevanceSortActive,
  SORT_TYPES,
  STRATEGY_TYPES,
  USER_CATEGORIES,
  VAULT_ASSET_TYPES,
  VAULT_CATEGORIES,
} from '../reducers/filtered-vaults-types.ts';
import {
  picklist,
  array,
  string,
  maxLength,
  pipe,
  transform,
  regex,
  check,
  safeParse,
  type GenericSchema,
  strictObject,
} from 'valibot';
import { FILTER_DEFAULTS } from './filter-values.ts';
import { areArraysEqual, isDefined } from './array-utils.ts';

const CHAIN_IDS = Object.keys(chainConfigs) as ChainId[];
const AVG_APY_PICK = ['default', ...AVG_APY_PERIODS.map(n => `${n}` as const)] as const;

/** array where each item validates independently; invalid items drop instead of failing the whole list */
function looseArray<TItem>(itemSchema: GenericSchema<string, TItem>) {
  return pipe(
    array(
      pipe(
        string(),
        transform((v): TItem | undefined => {
          const parsed = safeParse(itemSchema, v);
          return parsed.success ? parsed.output : undefined;
        })
      )
    ),
    transform((v): TItem[] => v.filter(isDefined))
  );
}

const $csv = pipe(string(), maxLength(1024), transform(splitList));
const $kv = pipe(
  $csv,
  transform(values =>
    Object.fromEntries(values.map(value => value.split(':', 2) as [string, string | undefined]))
  )
);
const $platformId = pipe(string(), maxLength(255), regex(/^[a-zA-Z0-9][a-zA-Z0-9-]+$/));
const $stringBool = pipe(
  string(),
  transform(v => v === 'true' || v === '1')
);
const $bigNumber = pipe(
  string(),
  maxLength(255),
  transform(v => new BigNumber(v)),
  check(v => v.isFinite() && v.gte(0))
);
const $subSortApy = pipe(
  picklist(AVG_APY_PICK),
  transform(
    (v): AvgApySortType => (v === 'default' ? 'default' : (parseInt(v, 10) as AvgApySortType))
  )
);

const $sort = picklist(SORT_TYPES);
const $sortDirection = picklist(['asc', 'desc']);
const $vaultCategory = pipe($csv, looseArray(picklist(VAULT_CATEGORIES)));
const $userCategory = picklist(USER_CATEGORIES);
const $strategyType = picklist(STRATEGY_TYPES);
const $assetType = pipe($csv, looseArray(picklist(VAULT_ASSET_TYPES)));
const $searchText = pipe(string(), maxLength(255));
const $chainIds = pipe($csv, looseArray(picklist(CHAIN_IDS)));
const $platformIds = pipe($csv, looseArray($platformId));
const $minimumUnderlyingTvl = pipe(
  $bigNumber,
  check(v => v.gt(0))
);
const $subSort = pipe($kv, strictObject({ apy: $subSortApy }));

export type FilterUrlCarry = Array<[string, string]>;

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

type FieldCodec<K extends keyof FilterValues> = {
  queryKey: string;
  schema: GenericSchema<string, NonNullable<FilteredVaultsPreset[K]>>;
  serialize: (value: NonNullable<FilteredVaultsPreset[K]>) => string;
  /** true when the value equals the default; used symmetrically to drop defaults on both serialize and parse */
  isDefault: (value: NonNullable<FilteredVaultsPreset[K]>) => boolean;
};

function splitList(value: string, maxItems: number = 50): string[] {
  return value
    .split(',', maxItems)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

function serializeList(values: string[]): string {
  return values.join(',');
}

function serializeScalar<T extends { toString: () => string }>(value: T): string {
  return value.toString();
}

function serializeBoolean(value: boolean): string {
  return value ? '1' : '0';
}

function serializeBigNumber(value: BigNumber): string {
  return value.toString(10);
}

function serializeObject<T extends { toString: () => string }>(value: Record<string, T>): string {
  return serializeList(Object.entries(value).map(([k, v]) => `${k}:${v}`));
}

function isDefaultScalar<T>(defaultValue: T) {
  return (value: T | undefined | null) =>
    value === undefined || value === null || value === defaultValue;
}

type CompareFn<T> = (a: T, b: T) => 1 | 0 | -1;

function isDefaultList<T>(defaultValue: T[], compareFn?: CompareFn<T>) {
  const sortedDefault = [...defaultValue].sort(compareFn);
  return (value: T[] | undefined | null) => {
    // empty (or missing) counts as default
    if (value === undefined || value === null || value.length === 0) {
      return true;
    }
    // different length => not default
    if (value.length !== sortedDefault.length) {
      return false;
    }
    const sortedValue = [...value].sort(compareFn);
    return areArraysEqual(sortedValue, sortedDefault, (a, b) =>
      compareFn ? compareFn(a, b) === 0 : a === b
    );
  };
}

function isDefaultBigNumber(defaultValue: BigNumber) {
  return (value: BigNumber | undefined | null) =>
    value === undefined || value === null || value.eq(defaultValue);
}

/**
 * Every FilterValues field must have an entry saying how it (de)serializes to
 * the url/storage search string. Declaration order is the canonical param order.
 */
export const FIELD_CODECS: { [K in keyof FilterValues]: false | FieldCodec<K> } = {
  platformIds: {
    queryKey: 'platform',
    schema: $platformIds,
    serialize: serializeList,
    isDefault: isDefaultList(FILTER_DEFAULTS['platformIds']),
  },
  chainIds: {
    queryKey: 'chain',
    schema: $chainIds,
    serialize: serializeList,
    isDefault: isDefaultList(FILTER_DEFAULTS['chainIds']),
  },
  vaultCategory: {
    queryKey: 'category',
    schema: $vaultCategory,
    serialize: serializeList,
    isDefault: isDefaultList(FILTER_DEFAULTS['vaultCategory']),
  },
  assetType: {
    queryKey: 'type',
    schema: $assetType,
    serialize: serializeList,
    isDefault: isDefaultList(FILTER_DEFAULTS['assetType']),
  },
  strategyType: {
    queryKey: 'product',
    schema: $strategyType,
    serialize: serializeScalar,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['strategyType']),
  },
  userCategory: {
    queryKey: 'tab',
    schema: $userCategory,
    serialize: serializeScalar,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['userCategory']),
  },
  searchText: {
    queryKey: 'q',
    schema: $searchText,
    serialize: serializeScalar,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['searchText']),
  },
  minimumUnderlyingTvl: {
    queryKey: 'mintvl',
    schema: $minimumUnderlyingTvl,
    serialize: serializeBigNumber,
    isDefault: isDefaultBigNumber(FILTER_DEFAULTS['minimumUnderlyingTvl']),
  },
  onlyBoosted: {
    queryKey: 'boosted',
    schema: $stringBool,
    serialize: serializeBoolean,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['onlyBoosted']),
  },
  onlyZappable: {
    queryKey: 'zappable',
    schema: $stringBool,
    serialize: serializeBoolean,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['onlyZappable']),
  },
  onlyEarningPoints: {
    queryKey: 'points',
    schema: $stringBool,
    serialize: serializeBoolean,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['onlyEarningPoints']),
  },
  onlyRetired: {
    queryKey: 'retired',
    schema: $stringBool,
    serialize: serializeBoolean,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['onlyRetired']),
  },
  onlyPaused: {
    queryKey: 'paused',
    schema: $stringBool,
    serialize: serializeBoolean,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['onlyPaused']),
  },
  onlyUnstakedClm: false,
  sort: {
    queryKey: 'sort',
    schema: $sort,
    serialize: serializeScalar,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['sort']),
  },
  sortDirection: {
    queryKey: 'dir',
    schema: $sortDirection,
    serialize: serializeScalar,
    isDefault: isDefaultScalar(FILTER_DEFAULTS['sortDirection']),
  },
  subSort: {
    queryKey: 'ssort',
    schema: $subSort,
    serialize: serializeObject,
    isDefault(value) {
      for (const key of keys(FILTER_DEFAULTS['subSort'])) {
        const a = FILTER_DEFAULTS['subSort'][key];
        const b = value[key];
        if (a !== b) {
          return false;
        }
      }
      return true;
    },
  },
};

/** Map (not object) so attacker-controlled keys like ?__proto__ can't hit the prototype chain */
const QUERY_KEY_TO_FIELD = new Map<string, keyof FilterValues>(
  entries(FIELD_CODECS)
    .map(([field, codec]) => (codec ? ([codec.queryKey, field] as const) : undefined))
    .filter(isDefined)
);

/** Serializes filters to a canonical search string ('' or '?...'): codec order, carry params last */
export function serializeFilters(
  filters: FilteredVaultsPreset,
  options?: SerializeFiltersOptions
): string {
  const params = new URLSearchParams();
  for (const [field, codec] of entries(FIELD_CODECS)) {
    if (codec === false) {
      continue;
    }

    const value = filters[field];
    if (value === undefined || value == null) {
      continue;
    }

    const isDefault = codec.isDefault as (value: unknown) => boolean;
    if (isDefault(value)) {
      continue;
    }

    const serialize = codec.serialize as (value: unknown) => string;
    const serialized = serialize(value);
    if (serialized !== undefined) {
      params.append(codec.queryKey, serialized);
    }
  }
  for (const [key, value] of options?.carry || []) {
    params.append(key, value);
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

export function serializeFilterState(
  filters: FilterValues,
  sortPickedDuringSearch: boolean
): string {
  // don't serialize `sort` if in relevance sort mode
  return serializeFilters(
    isRelevanceSortActive({ searchText: filters.searchText, sortPickedDuringSearch }) ?
      { ...filters, sort: 'default' }
    : filters
  );
}

/** invalid or default-valued params drop but stay recognized; unknown params go to carry */
export function parseFilterSearch(search: string): ParsedFilterSearch {
  const params = new URLSearchParams(search);
  const preset: FilteredVaultsPreset = {};
  const carry: FilterUrlCarry = [];
  let recognized = false;

  for (const [key, value] of params.entries()) {
    const field = QUERY_KEY_TO_FIELD.get(key);
    if (field === undefined) {
      carry.push([key, value]);
      continue;
    }
    const codec = FIELD_CODECS[field];
    if (codec === false) {
      continue;
    }

    recognized = true;
    // invalid input fails the schema (skip); valid-but-default is dropped so preset stays sparse
    const result = safeParse(codec.schema, value);
    if (result.success) {
      const isDefault = codec.isDefault as (value: unknown) => boolean;
      if (!isDefault(result.output)) {
        // ts cannot correlate field and parsed value through the map lookup
        (preset as Record<keyof FilterValues, unknown>)[field] = result.output;
      }
    }
  }

  return { preset, recognized, carry };
}

/** Canonical form of a search string (parse + re-serialize) */
export function canonicalizeSearch(search: string, options?: SerializeFiltersOptions): string {
  const { preset, carry } = parseFilterSearch(search);
  return serializeFilters(preset, {
    ...options,
    carry: options?.carry ? [...carry, ...options.carry] : carry,
  });
}

export type FilterUrlSyncDecision = {
  /** canonical form of the observed url; caller must store it as the new lastSeenUrl */
  seenUrl: string;
  apply?: FilteredVaultsPreset;
  write?: string;
};

/** inbound (url moved with differing filters) beats outbound (state written out); comparisons are canonical */
export function decideFilterUrlSync(
  locationSearch: string,
  lastSeenUrl: string | undefined,
  stateSearch: string
): FilterUrlSyncDecision {
  const { preset, recognized, carry } = parseFilterSearch(locationSearch);
  const urlNow = serializeFilters(preset, { carry });

  if (urlNow !== lastSeenUrl && recognized && serializeFilters(preset) !== stateSearch) {
    return { seenUrl: urlNow, apply: preset };
  }

  // state (pending) drives the url; the pending value is always a complete, valid filter set
  const target = canonicalizeSearch(stateSearch, { carry });
  if (target !== urlNow) {
    return { seenUrl: urlNow, write: target };
  }

  return { seenUrl: urlNow };
}
