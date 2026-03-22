import type { Abi } from 'viem';

export const CircleBeefyZapReceiverAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_usdc', type: 'address' },
      { internalType: 'address', name: '_messageTransmitter', type: 'address' },
      { internalType: 'address', name: '_zap', type: 'address' },
      { internalType: 'address', name: '_recovery', type: 'address' },
      { internalType: 'uint256', name: '_fee', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'InvalidAmount', type: 'error' },
  { inputs: [], name: 'InvalidBurnMessage', type: 'error' },
  { inputs: [], name: 'InvalidCaller', type: 'error' },
  { inputs: [], name: 'InvalidHookData', type: 'error' },
  { inputs: [], name: 'InvalidMessage', type: 'error' },
  { inputs: [], name: 'InvalidRecipient', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'zap', type: 'address' }],
    name: 'InvalidZap',
    type: 'error',
  },
  { inputs: [], name: 'RelayFailure', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'relayer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'FeePaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'oldFee', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'newFee', type: 'uint256' },
    ],
    name: 'FeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldRecovery', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newRecovery', type: 'address' },
    ],
    name: 'RecoveryAddressUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'amountIn', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'refundedAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'recoveredAmount', type: 'uint256' },
    ],
    name: 'ZapExecuted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'fee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'messageTransmitter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
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
    inputs: [{ internalType: 'bytes', name: 'message', type: 'bytes' }],
    name: 'processHook',
    outputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'bool', name: 'zapSuccess', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'recovery',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'message', type: 'bytes' },
      { internalType: 'bytes', name: 'attestation', type: 'bytes' },
    ],
    name: 'relay',
    outputs: [{ internalType: 'bool', name: 'zapStatus', type: 'bool' }],
    stateMutability: 'nonpayable',
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
    inputs: [{ internalType: 'uint256', name: '_fee', type: 'uint256' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_recovery', type: 'address' }],
    name: 'setRecovery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenManager',
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
    name: 'usdc',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'zap',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

/** ZapPayload ABI params for use with encodeAbiParameters */
export const ZapPayloadAbiParams = [
  {
    type: 'tuple',
    components: [
      { name: 'recipient', type: 'address' },
      {
        name: 'outputs',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'minOutputAmount', type: 'uint256' },
        ],
      },
      {
        name: 'relay',
        type: 'tuple',
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
      {
        name: 'route',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
          {
            name: 'tokens',
            type: 'tuple[]',
            components: [
              { name: 'token', type: 'address' },
              { name: 'index', type: 'int32' },
            ],
          },
        ],
      },
    ],
  },
] as const;
