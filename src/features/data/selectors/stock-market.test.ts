import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { getStockWeekendDifference, selectStockTokenName } from './stock-market.ts';
import type { TokenErc20 } from '../entities/token.ts';

const difference = (price: string, closePrice: string) =>
  getStockWeekendDifference(new BigNumber(price), new BigNumber(closePrice))?.toFixed(4);

describe('getStockWeekendDifference', () => {
  it('reports the signed move from the close', () => {
    expect(difference('325.26', '320.08')).toBe('0.0162');
    expect(difference('336.77', '346.57')).toBe('-0.0283');
    expect(difference('320.08', '320.08')).toBe('0.0000');
  });

  it('gives up without both prices', () => {
    expect(getStockWeekendDifference(undefined, new BigNumber(1))).toBeUndefined();
    expect(getStockWeekendDifference(new BigNumber(1), undefined)).toBeUndefined();
  });

  it('suppresses the 1.0 placeholder left by a null price quote', () => {
    expect(difference('1', '258.15')).toBeUndefined();
  });

  it('suppresses a junk close that would divide out to a huge move', () => {
    expect(difference('2', '0.0000001')).toBeUndefined();
    expect(difference('2', '0')).toBeUndefined();
  });
});

const token = (name: string | undefined, symbol: string) => ({ name, symbol }) as TokenErc20;

describe('selectStockTokenName', () => {
  it('keeps a plain issuer name', () => {
    expect(selectStockTokenName(token('Apple Inc.', 'AAPL'))).toBe('Apple Inc.');
  });

  it('drops the Robinhood token suffix', () => {
    expect(selectStockTokenName(token('Tesla • Robinhood Token', 'TSLA'))).toBe('Tesla');
    expect(selectStockTokenName(token('SPDR S&P 500 ETF Trust • Robinhood Token', 'SPY'))).toBe(
      'SPDR S&P 500 ETF Trust'
    );
  });

  it('falls back to the symbol when the address book has no name', () => {
    expect(selectStockTokenName(token(undefined, 'NVDA'))).toBe('NVDA');
  });
});
