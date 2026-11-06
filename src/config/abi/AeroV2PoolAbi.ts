import type { Abi } from 'viem';

export const AeroV2PoolAbi = [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'metadata',
    outputs: [
      { internalType: 'uint256', name: 'dec0', type: 'uint256' },
      { internalType: 'uint256', name: 'dec1', type: 'uint256' },
      { internalType: 'uint256', name: 'r0', type: 'uint256' },
      { internalType: 'uint256', name: 'r1', type: 'uint256' },
      { internalType: 'address', name: 't0', type: 'address' },
      { internalType: 'address', name: 't1', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'POOL_TYPE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;
