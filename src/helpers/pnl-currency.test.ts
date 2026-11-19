import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { calculatePnlInCurrency } from './pnl-currency.ts';

const bn = (value: number) => new BigNumber(value);
const transaction = (time: number, shares: number, usd: number) => ({
  datetime: new Date(time * 1000),
  shareDiff: bn(shares),
  shareToUnderlyingPrice: bn(1),
  underlyingToUsdPrice: bn(usd),
});

describe('performance in a reference currency', () => {
  it('uses historical entry prices instead of dividing USD PNL by the current BTC price', () => {
    const result = calculatePnlInCurrency(
      [transaction(100, 1, 20000)],
      [{ t: 100, v: 20000 }],
      bn(40000),
      bn(40000),
      bn(1.1),
      bn(4000)
    );
    expect(result?.atDeposit.toNumber()).toBe(1);
    expect(result?.now.toNumber()).toBe(1.1);
    expect(result?.pnl.toNumber()).toBe(0.1);
    expect(result?.percentage.toNumber()).toBe(0.1);
    expect(result?.yield.toNumber()).toBe(0.1);
  });
  it('keeps BTC PNL at zero when only the dollar price doubles', () => {
    const result = calculatePnlInCurrency(
      [transaction(100, 1, 20000)],
      [{ t: 100, v: 20000 }],
      bn(40000),
      bn(40000),
      bn(1),
      bn(0)
    );
    expect(result?.pnl.toNumber()).toBe(0);
  });
  it('uses FIFO entry costs for multiple deposits and a partial withdrawal', () => {
    const result = calculatePnlInCurrency(
      [transaction(100, 1, 20000), transaction(200, 1, 40000), transaction(300, -1.5, 60000)],
      [
        { t: 100, v: 10000 },
        { t: 200, v: 40000 },
        { t: 300, v: 60000 },
      ],
      bn(60000),
      bn(60000),
      bn(1),
      bn(0)
    );
    expect(result?.atDeposit.toNumber()).toBe(0.5);
    expect(result?.pnl.toNumber()).toBe(0);
  });
  it.each([0, NaN, Infinity])('rejects an invalid current quote: %s', quote => {
    expect(calculatePnlInCurrency([], [], bn(quote), bn(1), bn(1), bn(0))).toBeNull();
  });
  it('does not invent an entry price when historical data is missing or stale', () => {
    expect(
      calculatePnlInCurrency([transaction(100, 1, 1)], [], bn(1), bn(1), bn(1), bn(0))
    ).toBeNull();
    expect(
      calculatePnlInCurrency(
        [transaction(300000, 1, 1)],
        [{ t: 100, v: 1 }],
        bn(1),
        bn(1),
        bn(1),
        bn(0)
      )
    ).toBeNull();
  });
});
