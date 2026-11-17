import type { Abi } from 'viem';

const tokenComponents = [
  { name: 'tokenType', type: 'uint8' },
  { name: 'data', type: 'bytes' },
] as const;

export const EnsoRouterAbi = [
  {
    type: 'function',
    name: 'routeSingle',
    stateMutability: 'payable',
    inputs: [
      { name: 'tokenIn', type: 'tuple', components: tokenComponents },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: 'response', type: 'bytes' }],
  },
  {
    type: 'function',
    name: 'safeRouteSingle',
    stateMutability: 'payable',
    inputs: [
      { name: 'tokenIn', type: 'tuple', components: tokenComponents },
      { name: 'tokenOut', type: 'tuple', components: tokenComponents },
      { name: 'receiver', type: 'address' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: 'response', type: 'bytes' }],
  },
] as const satisfies Abi;
