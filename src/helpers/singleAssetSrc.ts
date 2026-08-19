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

const symbolAliases: Record<string, string> = {
  AAPLc: 'AAPL',
  AAPLrh: 'AAPL',
  COINrh: 'COIN',
  GMErh: 'GME',
  GOOGLc: 'GOOGL',
  INTCrh: 'INTC',
  METAc: 'META',
  MSFTrh: 'MSFT',
  NVDAc: 'NVDA',
  NVDArh: 'NVDA',
  RDDTrh: 'RDDT',
  SPCXrh: 'SPCX',
  SPYrh: 'SPY',
  TSLArh: 'TSLA',
  USOrh: 'USO',
};

export function getSingleAssetSrc(symbol: TokenEntity['id'], chainId?: ChainEntity['id']) {
  const parsedSymbol = symbol.replace('.', '');
  const alias = symbolAliases[parsedSymbol];
  const ids =
    chainId ?
      [`${chainId}/${parsedSymbol}`, parsedSymbol, ...(alias ? [`${chainId}/${alias}`, alias] : [])]
    : [parsedSymbol, ...(alias ? [alias] : [])];

  return keyToUrl(ids);
}

export function singleAssetExists(symbol: TokenEntity['id'], chainId?: ChainEntity['id']): boolean {
  return getSingleAssetSrc(symbol, chainId) !== undefined;
}
