import type { Abi } from 'viem';

export const ConicLpTokenStakerAbi = [
  {
    inputs: [],
    name: 'minter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'conicPool', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'getUserBalanceForPool',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'conicPool', type: 'address' },
    ],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;
