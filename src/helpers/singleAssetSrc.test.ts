import { describe, expect, it } from 'vitest';
import { getSingleAssetSrc, getTokenAssetId } from './singleAssetSrc.ts';

describe('token images with shared tickers', () => {
  it('uses the Cloudflare stock image without replacing the other NET token image', () => {
    const stock = { id: 'NETrh', symbol: 'NET', chainId: 'robinhood' } as const;
    const otherToken = { id: 'NET', symbol: 'NET', chainId: 'robinhood' } as const;

    expect(getSingleAssetSrc(getTokenAssetId(stock), stock.chainId)).toContain('/NETrh.png');
    expect(getSingleAssetSrc(getTokenAssetId(otherToken), otherToken.chainId)).toContain(
      '/NET.svg'
    );
  });

  it('supports token images requested without an id', () => {
    const token = { symbol: 'USDG', chainId: 'robinhood' } as const;
    expect(getSingleAssetSrc(getTokenAssetId(token), token.chainId)).toBe(
      getSingleAssetSrc('USDG', token.chainId)
    );
    expect(getSingleAssetSrc(getTokenAssetId(token), token.chainId)).toBeDefined();
  });
});
