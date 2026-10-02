import type { Abi } from 'viem';

export const OneInchAggregationRouterV6Abi = [
  {
    type: 'function',
    name: 'swap',
    stateMutability: 'payable',
    inputs: [
      { name: 'executor', type: 'address' },
      {
        name: 'desc',
        type: 'tuple',
        components: [
          { name: 'srcToken', type: 'address' },
          { name: 'dstToken', type: 'address' },
          { name: 'srcReceiver', type: 'address' },
          { name: 'dstReceiver', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'minReturnAmount', type: 'uint256' },
          { name: 'flags', type: 'uint256' },
        ],
      },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [
      { name: 'returnAmount', type: 'uint256' },
      { name: 'spentAmount', type: 'uint256' },
    ],
  },
] as const satisfies Abi;
