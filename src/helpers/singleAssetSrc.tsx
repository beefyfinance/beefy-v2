import { TokenEntity } from '../features/data/entities/token';
import { ChainEntity } from '../features/data/entities/chain';

const singleAssetRequire = require.context('../images/single-assets', true, /\.(svg|webp|png)$/);
const singleAssets = Object.fromEntries(
  singleAssetRequire.keys().map(path => [path.substring(2, path.lastIndexOf('.')), path])
);
const singleAssetCache = {};

export function getSingleAssetSrc(symbol: TokenEntity['id'], chainId?: ChainEntity['id']) {
  const parsedSymbol = symbol.replace('.', '');
  const ids = chainId ? [`${chainId}/${parsedSymbol}`, parsedSymbol] : [parsedSymbol];

  for (const id of ids) {
    if (id in singleAssetCache) {
      return singleAssetCache[id];
    }

    if (id in singleAssets) {
      const asset = singleAssetRequire(singleAssets[id]).default;
      return (singleAssetCache[id] = asset);
    }
  }
}

export function singleAssetExists(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): boolean {
  let parsedSymbol = symbol.replace('.', '');
  const ids = chainId ? [`${chainId}/${parsedSymbol}`, parsedSymbol] : [parsedSymbol];

  for (const id of ids) {
    if (id in singleAssets) {
      return true;
    }
  }

  return false;
}
