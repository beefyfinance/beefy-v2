import { describe, expect, it } from 'vitest';
import {
  areSameSingleAssets,
  getSingleAssetSrc,
  isSameSingleAsset,
  type SingleAsset,
  singleAssetKeys,
} from './singleAssetSrc.ts';
import ramUrl from '../images/single-assets/RAM.png?url';
import robinhoodRamUrl from '../images/single-assets/robinhood/RAM.png?url';
import up33Url from '../images/single-assets/UP33.svg?url';
import usdcUrl from '../images/single-assets/USDC.svg?url';
import usdceUrl from '../images/single-assets/USDCe.svg?url';

describe('singleAssetKeys', () => {
  it('tries chain id, chain symbol, then symbol', () => {
    expect(singleAssetKeys({ id: 'NETrh', symbol: 'NET', chainId: 'robinhood' })).toEqual([
      'robinhood/by-id/NETrh',
      'robinhood/NET',
      'NET',
    ]);
  });

  it('skips the id key without an id', () => {
    expect(singleAssetKeys({ symbol: 'NET', chainId: 'robinhood' })).toEqual([
      'robinhood/NET',
      'NET',
    ]);
  });

  it('strips the first dot from the symbol but not the id', () => {
    expect(singleAssetKeys({ id: 'USDC.e', symbol: 'USDC.e', chainId: 'arbitrum' })).toEqual([
      'arbitrum/by-id/USDC.e',
      'arbitrum/USDCe',
      'USDCe',
    ]);
  });
});

describe('getSingleAssetSrc', () => {
  it('finds an image by symbol', () => {
    expect(getSingleAssetSrc({ symbol: 'USDC', chainId: 'base' })).toBe(usdcUrl);
  });

  it('prefers the chain image for a symbol', () => {
    expect(getSingleAssetSrc({ symbol: 'RAM', chainId: 'robinhood' })).toBe(robinhoodRamUrl);
    expect(getSingleAssetSrc({ symbol: 'RAM', chainId: 'base' })).toBe(ramUrl);
  });

  it('finds a dotted symbol without its dot', () => {
    expect(getSingleAssetSrc({ symbol: 'USDC.e', chainId: 'arbitrum' })).toBe(usdceUrl);
  });

  it('ignores images named after the id outside by-id', () => {
    expect(getSingleAssetSrc({ id: 'UP', symbol: 'UP33', chainId: 'robinhood' })).toBe(up33Url);
  });

  it('returns undefined when nothing matches', () => {
    expect(getSingleAssetSrc({ id: 'nope', symbol: 'nope', chainId: 'base' })).toBeUndefined();
  });
});

describe('isSameSingleAsset', () => {
  it('compares id, symbol and chain', () => {
    const asset: SingleAsset = { id: 'NETrh', symbol: 'NET', chainId: 'robinhood' };
    expect(isSameSingleAsset(asset, { ...asset })).toBe(true);
    expect(isSameSingleAsset(asset, { ...asset, id: 'NET' })).toBe(false);
    expect(isSameSingleAsset(asset, { ...asset, symbol: 'NETT' })).toBe(false);
    expect(isSameSingleAsset(asset, { ...asset, chainId: 'base' })).toBe(false);
  });

  it('ignores other token fields', () => {
    const asset: SingleAsset = { id: 'NETrh', symbol: 'NET', chainId: 'robinhood' };
    const token = { ...asset, address: '0x1', decimals: 18 };
    expect(isSameSingleAsset(asset, token)).toBe(true);
  });
});

describe('areSameSingleAssets', () => {
  const net: SingleAsset = { id: 'NETrh', symbol: 'NET', chainId: 'robinhood' };
  const usdg: SingleAsset = { id: 'USDG', symbol: 'USDG', chainId: 'robinhood' };

  it('compares assets in order', () => {
    expect(areSameSingleAssets([net, usdg], [{ ...net }, { ...usdg }])).toBe(true);
    expect(areSameSingleAssets([net, usdg], [usdg, net])).toBe(false);
    expect(areSameSingleAssets([net, usdg], [net])).toBe(false);
  });

  it('treats a missing list as equal only to another missing list', () => {
    expect(areSameSingleAssets(undefined, undefined)).toBe(true);
    expect(areSameSingleAssets(undefined, [])).toBe(false);
    expect(areSameSingleAssets([], undefined)).toBe(false);
  });
});
