import type { Abi } from 'viem';

export const BeefyStargateZapAbi = [
  { inputs: [], name: 'FailedToSendNative', type: 'error' },
  {
    inputs: [],
    name: 'NotAuthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'vault', type: 'address' },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'DepositFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'vault', type: 'address' },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      { indexed: false, internalType: 'uint256', name: 'shares', type: 'uint256' },
    ],
    name: 'DepositSuccess',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vault',
            type: 'address',
          },
          { internalType: 'address', name: 'token', type: 'address' },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
        ],
        internalType: 'struct BeefyStargateZapReceiver.BridgeData',
        name: '_data',
        type: 'tuple',
      },
    ],
    name: '_depositLocal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
    name: 'inCaseTokensGetStuck',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_stargate', type: 'address' },
      {
        internalType: 'address',
        name: '_wnative',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '', type: 'uint16' },
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
      { internalType: 'uint256', name: '', type: 'uint256' },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      { internalType: 'uint256', name: '', type: 'uint256' },
      {
        internalType: 'bytes',
        name: 'payload',
        type: 'bytes',
      },
    ],
    name: 'sgReceive',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stargate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wnative',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const satisfies Abi;
