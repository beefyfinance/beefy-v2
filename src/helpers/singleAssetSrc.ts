import type { TokenEntity } from '../features/data/entities/token.ts';
import { createGlobLoader, removeExtension } from './globLoader.ts';

export type SingleAsset = Pick<TokenEntity, 'symbol'> &
  Partial<Pick<TokenEntity, 'id' | 'chainId'>>;

const pathToUrl = import.meta.glob<string>('../images/single-assets/**/*.(svg|webp|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(pathToUrl, path => {
  return removeExtension(path.replace('../images/single-assets/', ''));
});

export function singleAssetKeys({ id, symbol, chainId }: SingleAsset): string[] {
  const symbolKey = symbol.replace('.', '');
  if (!chainId) {
    return [symbolKey];
  }

  const symbolKeys = [`${chainId}/${symbolKey}`, symbolKey];
  return id ? [`${chainId}/by-id/${id}`, ...symbolKeys] : symbolKeys;
}

export function getSingleAssetSrc(asset: SingleAsset): string | undefined {
  return keyToUrl(singleAssetKeys(asset));
}

export function singleAssetExists(asset: SingleAsset): boolean {
  return getSingleAssetSrc(asset) !== undefined;
}

export function isSameSingleAsset(a: SingleAsset, b: SingleAsset): boolean {
  return a.id === b.id && a.symbol === b.symbol && a.chainId === b.chainId;
}
