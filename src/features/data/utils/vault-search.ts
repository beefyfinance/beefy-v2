import escapeStringRegexp from 'escape-string-regexp';
import { rankStringMatch, simplifySearchText } from '../../../helpers/string.ts';
import {
  isCowcentratedLikeVault,
  isVaultWithReceipt,
  type VaultEntity,
} from '../entities/vault.ts';

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

/** lowercase words of a query or token name; one tokenizer so both sides split identically */
export function toSearchWords(text: string): string[] {
  return simplifySearchText(text)
    .toLowerCase()
    .split(/[- /,]/g)
    .map(word => word.trim())
    .filter(word => word.length > 1);
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
  const nameRank = rankStringMatch(name, context.query);
  if (nameRank < 3) {
    return 100 - nameRank * 10; // exact 100, prefix 90, substring 80
  }

  if (context.words.length === 0) {
    return 0;
  }

  let min = 70;
  for (const { word, fuzzyToken, chainIds, platformIds: wordPlatformIds } of context.words) {
    let tier: number;
    if (name.includes(word)) {
      tier = 70;
    } else if (
      tokenSymbols.some(symbol => fuzzyToken.test(symbol)) ||
      tokenNameWords.includes(word)
    ) {
      tier = 60;
    } else if (
      tokenSymbols.some(symbol => symbol.toLowerCase().includes(word)) ||
      matchesTokenNameWordPrefix(tokenNameWords, word)
    ) {
      tier = 50;
    } else if (wordPlatformIds.size > 0 && platformIds.some(id => wordPlatformIds.has(id))) {
      tier = 40;
    } else if (chainIds.has(vault.chainId)) {
      tier = 30;
    } else if (word.length >= 4 && vault.id.toLowerCase().includes(word)) {
      tier = 20;
    } else {
      return 0;
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

  let best = 0;
  for (const address of addresses) {
    const lower = address.toLowerCase();
    if (lower === needle) {
      return 100;
    }
    if (lower.startsWith(needle)) {
      best = 60;
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
