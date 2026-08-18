import BigNumber from 'bignumber.js';
import { decodeFunctionData, type Abi } from 'viem';
import { describe, expect, it } from 'vitest';
import { getInsertIndex } from '../helpers/zap.ts';
import { buildCowcentratedZapDepositTx } from './CowcentratedVaultType.ts';

const CLM_ADDRESS = '0x1111111111111111111111111111111111111111';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
const B20_ADDRESS = '0xb2000000000000000000008bC8786B856E61707C';

const depositAbi = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      {
        name: '_amount0',
        type: 'uint256',
      },
      {
        name: '_amount1',
        type: 'uint256',
      },
      {
        name: '_minShares',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const satisfies Abi;

function decodeDepositArgs(data: string): readonly unknown[] {
  const decoded = decodeFunctionData({
    abi: depositAbi,
    data: data as `0x${string}`,
  });

  return decoded.args;
}

describe('buildCowcentratedZapDepositTx', () => {
  it('keeps B20 as an approval token but does not mark its deposit amount for balance replacement', () => {
    const amountA = new BigNumber('1000000');
    const amountB = new BigNumber('987654321');
    const minShares = new BigNumber('123456789');

    const zap = buildCowcentratedZapDepositTx(
      CLM_ADDRESS,
      amountA,
      amountB,
      minShares,
      USDC_ADDRESS,
      B20_ADDRESS,
      true
    );

    expect(zap.tokens).toEqual([
      { token: USDC_ADDRESS, index: getInsertIndex(0) },
      { token: B20_ADDRESS, index: -1 },
    ]);
    expect(decodeDepositArgs(zap.data)).toEqual([1000000n, 987654321n, 123456789n]);
  });

  it('keeps ordinary ERC-20 deposit amounts dynamically patched by the zap router', () => {
    const amountA = new BigNumber('1000000');
    const amountB = new BigNumber('2000000');
    const minShares = new BigNumber('3000000');

    const zap = buildCowcentratedZapDepositTx(
      CLM_ADDRESS,
      amountA,
      amountB,
      minShares,
      USDC_ADDRESS,
      USDT_ADDRESS,
      true
    );

    expect(zap.tokens).toEqual([
      { token: USDC_ADDRESS, index: getInsertIndex(0) },
      { token: USDT_ADDRESS, index: getInsertIndex(1) },
    ]);
    expect(decodeDepositArgs(zap.data)).toEqual([1000000n, 2000000n, 3000000n]);
  });
});
