import type { Abi } from 'viem';

export const EnsoRouterAbi = [
  {
    type: 'function',
    name: 'routeSingle',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'tokenIn',
        type: 'tuple',
        components: [
          { name: 'tokenType', type: 'uint8' },
          { name: 'data', type: 'bytes' },
        ],
      },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: 'response', type: 'bytes' }],
  },
] as const satisfies Abi;
