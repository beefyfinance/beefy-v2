import { TokenEntity } from '../features/data/entities/token';
import { ChainEntity } from '../features/data/entities/chain';
import { createGlobLoader, removeExtension } from './globLoader';

const pathToUrl = import.meta.glob('../images/single-assets/**/*.(svg|webp|png)', {
  as: 'url',
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
