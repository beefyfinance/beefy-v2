import { TokenEntity } from '../features/data/entities/token';
import { ChainEntity } from '../features/data/entities/chain';
import { createGlobLoader, removeExtension } from './globLoader';

const pathToLoader = import.meta.glob('../images/single-assets/**/*.(svg|webp|png)', {
  as: 'url',
});

const keyToLoader = createGlobLoader(pathToLoader, path => {
  return removeExtension(path.replace('../images/single-assets/', ''));
});

export function getSingleAssetLoader(symbol: TokenEntity['id'], chainId?: ChainEntity['id']) {
  const parsedSymbol = symbol.replace('.', '');
  const ids = chainId ? [`${chainId}/${parsedSymbol}`, parsedSymbol] : [parsedSymbol];

  return keyToLoader(ids);
}

export function singleAssetExists(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): boolean {
  return getSingleAssetLoader(symbol, chainId) !== undefined;
}
