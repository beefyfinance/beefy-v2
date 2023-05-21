import BigNumber from 'bignumber.js';
import type { TokenEntity } from '../entities/token';
import { mooAmountToOracleAmount } from './ppfs';
import { describe, expect, it } from 'vitest';

describe('Ppfs tests', () => {
  it('should properly compute oracle amount of tokens with same decimals: mooVenusBNB', () => {
    const mooToken: TokenEntity = {
      buyUrl: null,
      chainId: 'bsc',
      address: '0x6BE4741AB0aD233e4315a10bc783a7B923386b71',
      decimals: 18,
      id: 'mooVenusBNB',
      symbol: 'mooVenusBNB',
      oracleId: 'mooVenusBNB',
      type: 'erc20',
      description: null,
      website: null,
      documentation: null,
    };

    const depositToken: TokenEntity = {
      buyUrl: null,
      chainId: 'bsc',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      decimals: 18,
      id: 'WBNB',
      symbol: 'WBNB',
      oracleId: 'BNB',
      type: 'erc20',
      description: null,
      website: null,
      documentation: null,
    };
    const mooAmount = new BigNumber('0.086560461734815659');
    const ppfs = new BigNumber('1.155580391227848799');
    const expectedOracleAmount = new BigNumber('0.100027572236381514');

    const actualOracleAmount = mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooAmount);
    expect(actualOracleAmount.decimalPlaces(18).toString(10)).toBe(
      expectedOracleAmount.decimalPlaces(18).toString(10)
    );
  });

  it('should properly compute oracle amount of tokens with different decimals: mooScreamWBTC', () => {
    const mooToken: TokenEntity = {
      buyUrl: null,
      chainId: 'fantom',
      address: '0x97927aBfE1aBBE5429cBe79260B290222fC9fbba',
      decimals: 18,
      id: 'mooScreamWBTC',
      symbol: 'mooScreamWBTC',
      oracleId: 'mooScreamWBTC',
      type: 'erc20',
      description: null,
      website: null,
      documentation: null,
    };

    const depositToken: TokenEntity = {
      buyUrl: null,
      chainId: 'fantom',
      address: '0x321162Cd933E2Be498Cd2267a90534A804051b11',
      decimals: 8,
      id: 'WBTC',
      symbol: 'WBTC',
      oracleId: 'BTC',
      type: 'erc20',
      description: null,
      website: null,
      documentation: null,
    };

    const mooAmount = new BigNumber('0.000000000000092138');
    const ppfs = new BigNumber('1.050525364085333037');
    const expectedOracleAmount = new BigNumber('0.00096793');

    const actualOracleAmount = mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooAmount);
    expect(actualOracleAmount.decimalPlaces(18).toString(10)).toBe(
      expectedOracleAmount.decimalPlaces(18).toString(10)
    );
  });
});
