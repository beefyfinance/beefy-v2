import { describe, expect, it } from 'vitest';
import { getCowcentratedDepositTokenInsertIndex, isB20TokenAddress } from './cowcentrated-zap.ts';
import { getInsertIndex } from './zap.ts';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
const GOOGLC_B20_ADDRESS = '0xb2000000000000000000002D0BA3164cc74f58B7';
const METAC_B20_ADDRESS = '0xb2000000000000000000008bC8786B856E61707C';

describe('cowcentrated zap deposit token insert index', () => {
  it('detects Base B20 token addresses by address prefix', () => {
    expect(isB20TokenAddress(GOOGLC_B20_ADDRESS)).toBe(true);
    expect(isB20TokenAddress(METAC_B20_ADDRESS)).toBe(true);
    expect(isB20TokenAddress(USDC_ADDRESS)).toBe(false);
  });

  it('does not dynamically patch B20 when it is deposit argument 1', () => {
    expect(getCowcentratedDepositTokenInsertIndex(GOOGLC_B20_ADDRESS, 1, true)).toBe(-1);
  });

  it('keeps ordinary ERC-20 deposit arguments dynamically patched', () => {
    expect(getCowcentratedDepositTokenInsertIndex(USDC_ADDRESS, 0, true)).toBe(getInsertIndex(0));
    expect(getCowcentratedDepositTokenInsertIndex(USDT_ADDRESS, 1, true)).toBe(getInsertIndex(1));
  });

  it('keeps B20 dynamically patched when it is not deposit argument 1', () => {
    expect(getCowcentratedDepositTokenInsertIndex(GOOGLC_B20_ADDRESS, 0, true)).toBe(
      getInsertIndex(0)
    );
  });
});
