import type { TokenEntity } from '../features/data/entities/token.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';
import { createGlobLoader, removeExtension } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/single-assets/**/*.(svg|webp|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl, path => {
  return removeExtension(path.replace('../images/single-assets/', ''));
});

export function getSingleAssetSrc(symbol: TokenEntity['id'], chainId?: ChainEntity['id']) {
  const parsedSymbol = symbol.replace('.', '');
  const ids = chainId ? [`${chainId}/${parsedSymbol}`, parsedSymbol] : [parsedSymbol];

  return keyToUrl(ids);
}

export function singleAssetExists(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): boolean {
  return getSingleAssetSrc(symbol, chainId) !== undefined;
}

/** Prefer the unique token id so tokens sharing a ticker can have different images. */
export function getTokenAssetId(
  token: Pick<TokenEntity, 'symbol' | 'chainId'> & Partial<Pick<TokenEntity, 'id'>>
): string {
  return token.id && singleAssetExists(token.id, token.chainId) ? token.id : token.symbol;
}
