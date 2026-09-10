import escapeStringRegexp from 'escape-string-regexp';
import { rankStringMatch, simplifySearchText } from '../../../helpers/string.ts';
import {
  isCowcentratedLikeVault,
  isVaultWithReceipt,
  type VaultEntity,
} from '../entities/vault.ts';

/** relevance tiers, best to worst; ordinal only, spaced so a tier can be slotted between */
const TIER = {
  /** the whole query is the vault name */
  NAME_EXACT: 100,
  /** the vault name starts with the whole query */
  NAME_PREFIX: 90,
  /** the whole query appears somewhere in the vault name */
  NAME_SUBSTRING: 80,
  /** every query word appears in the vault name, in any order */
  NAME_ALL_WORDS: 70,
  /** the word is an asset symbol (wrapped-aware) or a whole stock company-name word */
  TOKEN_EXACT: 60,
  /** the word is inside an asset symbol, or starts a stock company-name word */
  TOKEN_PARTIAL: 50,
  /** word matches platform exactly */
  PLATFORM: 40,
  /** word matches chain exactly */
  CHAIN: 30,
  /** a word of 4+ chars appears in the vault id */
  VAULT_ID: 20,
  NO_MATCH: 0,
} as const;

/** address queries score on their own scale; they disable text matching so the two never mix */
const ADDRESS_TIER = {
  EXACT: 100,
  PREFIX: 60,
  NO_MATCH: 0,
} as const;

/** entity findable by any of its lowercase texts (id + name words) */
export type SearchIndexEntry = {
  id: string;
  texts: string[];
};

export type VaultSearchWord = {
  word: string;
  /** TOKEN, WTOKEN or TOKENW; non-global as one instance is .test()ed across all vaults */
  fuzzyToken: RegExp;
  /** chain ids whose id/name exactly matches this word */
  chainIds: ReadonlySet<string>;
  platformIds: ReadonlySet<string>;
};

export type VaultSearchContext = {
  /** lowercase simplified full query */
  query: string;
  words: VaultSearchWord[];
  /** false lets the scorer skip the per-vault platform id lookup entirely */
  anyPlatformWords: boolean;
  /** set when the query is an address: all other matching is disabled */
  addressNeedle: string | undefined;
};

/** single emptiness predicate shared by the thunk and isRelevanceSortActive */
export function hasSearchText(searchText: string): boolean {
  return simplifySearchText(searchText).length > 0;
}

/** words of a query or token name, original case; for display strings like search suggestions */
export function toDisplayWords(text: string): string[] {
  return simplifySearchText(text)
    .split(/[- /,]/g)
    .map(word => word.trim())
    .filter(word => word.length > 1);
}

/** lowercase words of a query or token name; one tokenizer so both sides split identically */
export function toSearchWords(text: string): string[] {
  return toDisplayWords(text).map(word => word.toLowerCase());
}

export type SearchQueryKind = 'text' | 'address' | 'address-too-short';

export function classifySearchQuery(searchText: string): SearchQueryKind {
  const trimmed = searchText.trim();
  if (/^0x[0-9a-f]{6,}$/i.test(trimmed)) {
    return 'address';
  }
  if (/^0x[0-9a-f]{0,5}$/i.test(trimmed)) {
    return 'address-too-short';
  }
  return 'text';
}

export function buildVaultSearchContext(
  searchText: string,
  chainIndex: readonly SearchIndexEntry[],
  platformIndex: readonly SearchIndexEntry[]
): VaultSearchContext | undefined {
  const query = simplifySearchText(searchText).toLowerCase();
  if (query.length === 0) {
    return undefined;
  }

  if (classifySearchQuery(searchText) === 'address') {
    return {
      query,
      words: [],
      anyPlatformWords: false,
      addressNeedle: searchText.trim().toLowerCase(),
    };
  }

  const words = toSearchWords(query).map(
    (word): VaultSearchWord => ({
      word,
      fuzzyToken: fuzzyTokenRegex(word),
      chainIds: matchIndexExact(chainIndex, word),
      platformIds: matchIndexWordOrPrefix(platformIndex, word),
    })
  );

  return {
    query,
    words,
    anyPlatformWords: words.some(word => word.platformIds.size > 0),
    addressNeedle: undefined,
  };
}

/** Everything the scorer reads about a vault */
export type VaultSearchTarget = {
  vault: VaultEntity;
  /** from selectVaultTokenSymbols */
  tokenSymbols: string[];
  /** from selectVaultTokenNameWords; matched whole or by prefix, never substring */
  tokenNameWords: readonly string[];
  /** from selectFilterPlatformIdsForVault; pass [] when !context.anyPlatformWords */
  platformIds: readonly string[];
  /** on-chain strategy contract; only read in address mode */
  strategyAddress?: string;
};

/**
 * Relevance tier for a vault, 0 = no match.
 * Whole-query name matches first, then every word must match some field (min tier wins).
 */
export function scoreVaultForSearch(
  context: VaultSearchContext,
  target: VaultSearchTarget
): number {
  const { vault, tokenSymbols, tokenNameWords, platformIds, strategyAddress } = target;

  if (context.addressNeedle !== undefined) {
    return scoreVaultAddresses(context.addressNeedle, vault, strategyAddress);
  }

  const name = simplifySearchText(vault.names.list).toLowerCase();
  // rankStringMatch: 0 exact, 1 prefix, 2 substring, 3 no match -> fall through to the word loop
  switch (rankStringMatch(name, context.query)) {
    case 0:
      return TIER.NAME_EXACT;
    case 1:
      return TIER.NAME_PREFIX;
    case 2:
      return TIER.NAME_SUBSTRING;
  }

  if (context.words.length === 0) {
    return TIER.NO_MATCH;
  }

  let min: number = TIER.NAME_ALL_WORDS;
  for (const { word, fuzzyToken, chainIds, platformIds: wordPlatformIds } of context.words) {
    let tier: number;
    if (name.includes(word)) {
      tier = TIER.NAME_ALL_WORDS;
    } else if (
      tokenSymbols.some(symbol => fuzzyToken.test(symbol)) ||
      tokenNameWords.includes(word)
    ) {
      tier = TIER.TOKEN_EXACT;
    } else if (
      tokenSymbols.some(symbol => symbol.toLowerCase().includes(word)) ||
      matchesTokenNameWordPrefix(tokenNameWords, word)
    ) {
      tier = TIER.TOKEN_PARTIAL;
    } else if (wordPlatformIds.size > 0 && platformIds.some(id => wordPlatformIds.has(id))) {
      tier = TIER.PLATFORM;
    } else if (chainIds.has(vault.chainId)) {
      tier = TIER.CHAIN;
    } else if (word.length >= 4 && vault.id.toLowerCase().includes(word)) {
      tier = TIER.VAULT_ID;
    } else {
      return TIER.NO_MATCH;
    }
    min = Math.min(min, tier);
  }
  return min;
}

function scoreVaultAddresses(
  needle: string,
  vault: VaultEntity,
  strategyAddress: string | undefined
): number {
  const addresses = [vault.contractAddress, vault.depositTokenAddress];
  if (isCowcentratedLikeVault(vault)) {
    addresses.push(...vault.depositTokenAddresses, vault.poolAddress);
  }
  if (isVaultWithReceipt(vault)) {
    addresses.push(vault.receiptTokenAddress);
  }
  if (strategyAddress) {
    addresses.push(strategyAddress);
  }

  let best: number = ADDRESS_TIER.NO_MATCH;
  for (const address of addresses) {
    const lower = address.toLowerCase();
    if (lower === needle) {
      return ADDRESS_TIER.EXACT;
    }
    if (lower.startsWith(needle)) {
      best = ADDRESS_TIER.PREFIX;
    }
  }
  return best;
}

/** prefix once 3+ chars are typed; never substring so "base" does not find Coinbase */
export function matchesTokenNameWordPrefix(nameWords: readonly string[], word: string): boolean {
  return word.length >= 3 && nameWords.some(nameWord => nameWord.startsWith(word));
}

// TOKEN, WTOKEN or TOKENW; deliberately without the g flag: .test() on a global regex is stateful
export function fuzzyTokenRegex(token: string) {
  return new RegExp(`^w?${escapeStringRegexp(token)}w?$`, 'i');
}

function matchIndexExact(index: readonly SearchIndexEntry[], word: string): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const entry of index) {
    if (entry.texts.includes(word)) {
      ids.add(entry.id);
    }
  }
  return ids;
}

function matchIndexWordOrPrefix(
  index: readonly SearchIndexEntry[],
  word: string
): ReadonlySet<string> {
  const ids = new Set<string>();
  const allowPrefix = word.length >= 3;
  for (const entry of index) {
    if (entry.texts.some(text => text === word || (allowPrefix && text.startsWith(word)))) {
      ids.add(entry.id);
    }
  }
  return ids;
}
