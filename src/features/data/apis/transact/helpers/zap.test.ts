import { describe, expect, it } from 'vitest';
import { encodeAbiParameters, encodeFunctionData, maxUint256, parseAbi } from 'viem';
import { findInsertIndex, getInsertIndex } from './zap.ts';

const abi = parseAbi([
  'function flat(uint256 a, uint256 b)',
  'function nested(bytes commands, bytes[] inputs, uint256 deadline)',
]);

describe('findInsertIndex', () => {
  it('agrees with getInsertIndex for a plain top-level parameter', () => {
    const data = encodeFunctionData({ abi, functionName: 'flat', args: [1n, 2n] });

    expect(findInsertIndex(data, 1n)).toBe(getInsertIndex(0));
    expect(findInsertIndex(data, 2n)).toBe(getInsertIndex(1));
  });

  it('finds a word nested inside a dynamic array element', () => {
    const placeholder = maxUint256 - 1n;
    // a selector-less struct payload, as the Metarouter inputs are
    const inner = encodeAbiParameters(
      [{ type: 'tuple', components: [{ type: 'uint256' }, { type: 'uint256' }] }],
      [[7n, placeholder]]
    );
    const data = encodeFunctionData({
      abi,
      functionName: 'nested',
      args: ['0x22', [inner], 99n],
    });

    const index = findInsertIndex(data, placeholder);
    const word = data.slice(2 + index * 2, 2 + index * 2 + 64);
    expect(BigInt(`0x${word}`)).toBe(placeholder);
    expect(index % 32).toBe(4); // 32-byte aligned after the selector
  });

  it('throws when the value is absent', () => {
    const data = encodeFunctionData({ abi, functionName: 'flat', args: [1n, 2n] });

    expect(() => findInsertIndex(data, 3n)).toThrow(/found 0/);
  });

  it('throws when the value appears more than once', () => {
    const data = encodeFunctionData({ abi, functionName: 'flat', args: [5n, 5n] });

    expect(() => findInsertIndex(data, 5n)).toThrow(/found 2/);
  });
});
