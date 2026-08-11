import { createSelector } from '@reduxjs/toolkit';
import { isDefined } from '../utils/array-utils.ts';
import type { SearchIndexEntry } from '../utils/vault-search.ts';
import { selectAllChains } from './chains.ts';
import { selectAllPlatforms } from './platforms.ts';

export const selectChainSearchIndex = createSelector(selectAllChains, chains =>
  chains.map(
    (chain): SearchIndexEntry => ({
      id: chain.id,
      texts: toIndexTexts(chain.id, chain.name),
    })
  )
);

export const selectPlatformSearchIndex = createSelector(selectAllPlatforms, platforms =>
  platforms.filter(isDefined).map(
    (platform): SearchIndexEntry => ({
      id: platform.id,
      texts: toIndexTexts(platform.id, platform.name),
    })
  )
);

function toIndexTexts(id: string, name: string): string[] {
  return [...new Set([id.toLowerCase(), ...name.toLowerCase().split(/\s+/)])];
}
