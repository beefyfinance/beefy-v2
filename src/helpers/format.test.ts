import BigNumber from 'bignumber.js';
import { formatBigNumber, formatBigUsd, getBigNumOrder } from './format';

describe('Formatter tests', () => {
  it('should find a big number order of magnitude', () => {
    expect(getBigNumOrder(new BigNumber('0'))).toBe(0);
    expect(getBigNumOrder(new BigNumber('0.0001'))).toBe(0);
    expect(getBigNumOrder(new BigNumber('999.0001'))).toBe(0);
    expect(getBigNumOrder(new BigNumber('1000.0001'))).toBe(1);
    expect(getBigNumOrder(new BigNumber('1000000.0001'))).toBe(2);
    expect(getBigNumOrder(new BigNumber('1000000000.0001'))).toBe(3);
    expect(getBigNumOrder(new BigNumber('100000000000.0001'))).toBe(3);
    expect(getBigNumOrder(new BigNumber('1000000000000.0001'))).toBe(4);
    expect(getBigNumOrder(new BigNumber('1000000000000000.0001'))).toBe(5);
    expect(getBigNumOrder(new BigNumber('1000000000000000000.0001'))).toBe(6);
    expect(getBigNumOrder(new BigNumber('1000000000000000000000000.0001'))).toBe(8);
    expect(getBigNumOrder(new BigNumber('1000000000000000000000000000000.0001'))).toBe(10);
  });

  it('format Big numbers usd properly', () => {
    expect(formatBigUsd(new BigNumber('0'))).toBe('$0');
    expect(formatBigUsd(new BigNumber('0.0001'))).toBe('$0');
    expect(formatBigUsd(new BigNumber('10.6001'))).toBe('$10.60');
    expect(formatBigUsd(new BigNumber('999.0001'))).toBe('$999');
    expect(formatBigUsd(new BigNumber('999.02001'))).toBe('$999');
    expect(formatBigUsd(new BigNumber('1000.0001'))).toBe('$1,000');
    expect(formatBigUsd(new BigNumber('10000.0001'))).toBe('$10,000');
    expect(formatBigUsd(new BigNumber('1000000.0001'))).toBe('$1.00M');
    expect(formatBigUsd(new BigNumber('1230000.0001'))).toBe('$1.23M');
    expect(formatBigUsd(new BigNumber('1237000.0001'))).toBe('$1.24M');
    expect(formatBigUsd(new BigNumber('1000000000.0001'))).toBe('$1.00B');
    expect(formatBigUsd(new BigNumber('100000000000.0001'))).toBe('$100.00B');
    expect(formatBigUsd(new BigNumber('1110000000000.0001'))).toBe('$1.11T');
  });
  it('format Big numbers properly', () => {
    expect(formatBigNumber(new BigNumber('0'))).toBe('0');
    expect(formatBigNumber(new BigNumber('0.0001'))).toBe('0');
    expect(formatBigNumber(new BigNumber('10.6001'))).toBe('10.60');
    expect(formatBigNumber(new BigNumber('10.6661'))).toBe('10.67');
    expect(formatBigNumber(new BigNumber('999.0001'))).toBe('999');
    expect(formatBigNumber(new BigNumber('999.02001'))).toBe('999');
    expect(formatBigNumber(new BigNumber('999.99001'))).toBe('1,000');
    expect(formatBigNumber(new BigNumber('1000.0001'))).toBe('1,000');
    expect(formatBigNumber(new BigNumber('10000.0001'))).toBe('10,000');
    expect(formatBigNumber(new BigNumber('1000000.0001'))).toBe('1.00M');
    expect(formatBigNumber(new BigNumber('1230000.0001'))).toBe('1.23M');
    expect(formatBigNumber(new BigNumber('1237000.0001'))).toBe('1.24M');
    expect(formatBigNumber(new BigNumber('1000000000.0001'))).toBe('1.00B');
    expect(formatBigNumber(new BigNumber('100000000000.0001'))).toBe('100.00B');
    expect(formatBigNumber(new BigNumber('1110000000000.0001'))).toBe('1.11T');
  });
});
